/* Annotated portfolio — toolkit flow renderer
 *
 * Renders nodes + edges (loaded from per-track CSV via Jekyll) as a stable,
 * left-to-right layered flow diagram inside each `.track-flow` container.
 *
 * Lazy-mounts when the Technical disclosure opens, so closed disclosures
 * don't waste a render. Uses native window.d3 (already loaded site-wide).
 *
 * Data contract (embedded as JSON inside <script type="application/json">):
 *   { nodes: [{id, name, type, description?}, ...],
 *     edges: [{from, to, type, description?}, ...] }
 */
(function () {
  if (!window.d3) return;

  var COL_SPACING = 170;   // horizontal distance between layers
  var ROW_SPACING = 72;    // vertical distance between nodes in a layer
  var PAD = 28;            // viewBox padding

  function slug(s) {
    return String(s || 'default').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  }

  function uniq(arr) {
    var seen = {};
    return arr.filter(function (v) { return seen[v] ? false : (seen[v] = true); });
  }

  function layout(nodes, edges) {
    // Adjacency
    var succ = new Map(), pred = new Map();
    nodes.forEach(function (n) { succ.set(n.id, []); pred.set(n.id, []); });
    edges.forEach(function (e) {
      if (succ.has(e.from) && pred.has(e.to)) {
        succ.get(e.from).push(e.to);
        pred.get(e.to).push(e.from);
      }
    });

    // Layer assignment via Kahn's algorithm + longest path
    var layer = new Map();
    var indeg = new Map();
    nodes.forEach(function (n) { indeg.set(n.id, pred.get(n.id).length); });
    var queue = nodes.filter(function (n) { return indeg.get(n.id) === 0; }).map(function (n) { return n.id; });
    queue.forEach(function (id) { layer.set(id, 0); });
    while (queue.length) {
      var u = queue.shift();
      (succ.get(u) || []).forEach(function (v) {
        var nl = Math.max(layer.has(v) ? layer.get(v) : 0, layer.get(u) + 1);
        layer.set(v, nl);
        indeg.set(v, indeg.get(v) - 1);
        if (indeg.get(v) === 0) queue.push(v);
      });
    }
    // Fallback for cycles or disconnected
    nodes.forEach(function (n) { if (!layer.has(n.id)) layer.set(n.id, 0); });

    // Group by layer, preserving insertion order
    var layers = [];
    nodes.forEach(function (n) {
      var l = layer.get(n.id);
      if (!layers[l]) layers[l] = [];
      layers[l].push(n);
    });

    return { layers: layers, succ: succ, pred: pred };
  }

  function measure(svg, nodes) {
    var measureGroup = svg.append('g').attr('visibility', 'hidden');
    var sizes = new Map();
    nodes.forEach(function (n) {
      var text = measureGroup.append('text').attr('class', 'flow-node-label').text(n.name);
      var bb = text.node().getBBox();
      sizes.set(n.id, {
        w: Math.max(64, Math.ceil(bb.width) + 26),
        h: Math.max(30, Math.ceil(bb.height) + 16)
      });
    });
    measureGroup.remove();
    return sizes;
  }

  function placeNodes(layers, sizes, pred) {
    var pos = new Map();
    for (var l = 0; l < layers.length; l++) {
      if (!layers[l]) continue;
      var col = layers[l].slice();
      // Single barycenter pass: order each non-source layer by the mean
      // y-position of its predecessors. Cuts edge crossings in small DAGs.
      if (l > 0) {
        col.sort(function (a, b) {
          function mean(node) {
            var ps = (pred.get(node.id) || [])
              .map(function (pid) { return pos.has(pid) ? pos.get(pid).y : 0; });
            if (!ps.length) return 0;
            return ps.reduce(function (s, v) { return s + v; }, 0) / ps.length;
          }
          return mean(a) - mean(b);
        });
      }
      var total = (col.length - 1) * ROW_SPACING;
      col.forEach(function (n, i) {
        pos.set(n.id, { x: l * COL_SPACING, y: i * ROW_SPACING - total / 2 });
      });
    }
    return pos;
  }

  function init(container) {
    if (container.dataset.flowReady === '1') return;

    var dataEl = container.querySelector('[data-flow-data]');
    if (!dataEl) return;
    var raw;
    try { raw = JSON.parse(dataEl.textContent); }
    catch (err) { console.error('flow: invalid JSON', err); return; }

    var nodes = (raw.nodes || []).map(function (n) {
      return { id: String(n.id), name: n.name, type: n.type || '', description: n.description || '' };
    });
    var edges = (raw.edges || []).map(function (e) {
      return { from: String(e.from), to: String(e.to), type: e.type || 'default', description: e.description || '' };
    });
    if (!nodes.length) return;

    // Guard: if the container has zero width (e.g. disclosure was momentarily
    // hidden), abort and try again on the next toggle. getBBox returns 0 in
    // display:none subtrees, which produces a useless render.
    if (container.getBoundingClientRect().width === 0) return;

    container.dataset.flowReady = '1';

    // Tooltip
    var tooltip = document.createElement('div');
    tooltip.className = 'flow-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    container.appendChild(tooltip);

    function showTip(text, ev) {
      if (!text) return;
      tooltip.textContent = text;
      tooltip.classList.add('is-visible');
      moveTip(ev);
    }
    function moveTip(ev) {
      var r = container.getBoundingClientRect();
      var x = (ev.clientX - r.left) + 14;
      var y = (ev.clientY - r.top) + 14;
      // Keep tooltip inside the container horizontally
      var maxX = r.width - tooltip.offsetWidth - 8;
      if (x > maxX) x = maxX;
      if (x < 4) x = 4;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }
    function hideTip() { tooltip.classList.remove('is-visible'); }
    function tipFromElement(text, el) {
      var r = container.getBoundingClientRect();
      var b = el.getBoundingClientRect();
      showTip(text, {
        clientX: r.left + (b.left - r.left) + b.width / 2,
        clientY: r.top + (b.top - r.top) + b.height / 2
      });
    }

    // SVG
    var svg = d3.select(container).append('svg')
      .attr('class', 'flow-svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('role', 'img')
      .attr('aria-label', 'Signal flow diagram');

    var defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'flow-arrow-' + Math.random().toString(36).slice(2, 8))
      .attr('class', 'flow-arrow-marker')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9).attr('refY', 5)
      .attr('markerWidth', 7).attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L10,5 L0,10 z').attr('class', 'flow-arrow-head');
    var markerId = defs.select('marker').attr('id');

    // Layout
    var L = layout(nodes, edges);
    var sizes = measure(svg, nodes);
    var pos = placeNodes(L.layers, sizes, L.pred);

    // viewBox
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(function (n) {
      var p = pos.get(n.id), s = sizes.get(n.id);
      if (!p || !s) return;
      minX = Math.min(minX, p.x - s.w / 2);
      maxX = Math.max(maxX, p.x + s.w / 2);
      minY = Math.min(minY, p.y - s.h / 2);
      maxY = Math.max(maxY, p.y + s.h / 2);
    });
    var W = maxX - minX, H = maxY - minY;
    svg.attr('viewBox', (minX - PAD) + ' ' + (minY - PAD) + ' ' + (W + PAD * 2) + ' ' + (H + PAD * 2));

    // Edges
    var edgeG = svg.append('g').attr('class', 'flow-edges');
    edges.forEach(function (e) {
      var s = pos.get(e.from), t = pos.get(e.to);
      var ss = sizes.get(e.from), ts = sizes.get(e.to);
      if (!s || !t) return;
      var x1 = s.x + ss.w / 2;
      var y1 = s.y;
      var x2 = t.x - ts.w / 2 - 6; // leave room for arrowhead
      var y2 = t.y;
      var cx1 = x1 + (x2 - x1) * 0.55;
      var cx2 = x2 - (x2 - x1) * 0.55;
      var d = 'M' + x1 + ',' + y1 + ' C' + cx1 + ',' + y1 + ' ' + cx2 + ',' + y2 + ' ' + x2 + ',' + y2;
      var path = edgeG.append('path')
        .attr('class', 'flow-edge flow-edge--' + slug(e.type))
        .attr('d', d)
        .attr('marker-end', 'url(#' + markerId + ')')
        .attr('data-edge-type', e.type || 'default');
      if (e.description) {
        path
          .attr('tabindex', 0)
          .attr('role', 'button')
          .attr('aria-label', e.type ? (e.type + ': ' + e.description) : e.description)
          .on('mouseenter', function (ev) { showTip(e.description, ev); })
          .on('mousemove', moveTip)
          .on('mouseleave', hideTip)
          .on('focus', function () { tipFromElement(e.description, path.node()); })
          .on('blur', hideTip);
      }
    });

    // Nodes
    var nodeG = svg.append('g').attr('class', 'flow-nodes');
    nodes.forEach(function (n) {
      var p = pos.get(n.id), s = sizes.get(n.id);
      var g = nodeG.append('g')
        .attr('class', 'flow-node flow-node--' + slug(n.type))
        .attr('transform', 'translate(' + p.x + ',' + p.y + ')')
        .attr('data-node-type', n.type || '')
        .attr('tabindex', n.description ? 0 : null);
      g.append('rect')
        .attr('x', -s.w / 2).attr('y', -s.h / 2)
        .attr('width', s.w).attr('height', s.h);
      g.append('text')
        .attr('class', 'flow-node-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .text(n.name);
      if (n.description) {
        g.attr('aria-label', n.type ? (n.type + ': ' + n.name + ' — ' + n.description)
                                    : (n.name + ' — ' + n.description));
        g.on('mouseenter', function (ev) { showTip(n.description, ev); })
         .on('mousemove', moveTip)
         .on('mouseleave', hideTip)
         .on('focus', function () { tipFromElement(n.description, g.node()); })
         .on('blur', hideTip);
      } else {
        g.attr('aria-label', n.type ? (n.type + ': ' + n.name) : n.name);
      }
    });

    // Legend (only if there's more than one edge type to disambiguate)
    var types = uniq(edges.map(function (e) { return e.type; }).filter(Boolean));
    if (types.length > 1) {
      var legend = document.createElement('div');
      legend.className = 'flow-legend';
      legend.setAttribute('aria-label', 'Edge type legend');
      legend.innerHTML = types.map(function (t) {
        return (
          '<span class="flow-legend-item">' +
            '<svg class="flow-legend-swatch" viewBox="0 0 40 10" aria-hidden="true">' +
              '<line x1="0" y1="5" x2="40" y2="5" class="flow-edge flow-edge--' + slug(t) + '"></line>' +
            '</svg>' +
            '<span class="flow-legend-label">' + t.replace(/</g, '&lt;') + '</span>' +
          '</span>'
        );
      }).join('');
      container.appendChild(legend);
    }
  }

  function mountAllVisible() {
    Array.prototype.forEach.call(document.querySelectorAll('.track-flow'), function (c) {
      var details = c.closest('details');
      if (!details || details.open) init(c);
    });
  }

  function watchDisclosures() {
    Array.prototype.forEach.call(
      document.querySelectorAll('details.track-disclosure'),
      function (d) {
        if (d.dataset.flowWatched === '1') return;
        d.dataset.flowWatched = '1';
        d.addEventListener('toggle', function () {
          if (!d.open) return;
          Array.prototype.forEach.call(d.querySelectorAll('.track-flow'), init);
        });
      }
    );
  }

  function boot() {
    if (document.fonts && document.fonts.ready) {
      // Wait for fonts so getBBox() returns post-load widths
      document.fonts.ready.then(function () { mountAllVisible(); watchDisclosures(); });
    } else {
      mountAllVisible();
      watchDisclosures();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
