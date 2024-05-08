---
layout: publications
permalink: /publications/
title: publications
years: [2024, 2023, 2022, 2021, 2020, 2017]
nav: true
nav_order: 1
---
<!-- _pages/publications.md -->
<div class="publications">

{%- for y in page.years %}
  <h2 class="year">{{y}}</h2>
  {% bibliography -f papers -q @*[year={{y}}]* %}
{% endfor %}

</div>

<header class="post-header" style="margin-top: 25px">
  <h1>thesis</h1>
</header>

<div class="publications">
  <!--
  <h2 class="year">2026</h2>
  {% bibliography -f theses -q @*[year=2026]* %} -->

  <h2 class="year">2021</h2>
  {% bibliography -f theses -q @*[year=2021]* %}
</div>