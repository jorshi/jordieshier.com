---
layout: external
permalink: /adc2024_dev/
nav: false
---

# TorchDrum
<p>An audio-driven 808 drum synthesiser built with PyTorch and JUCE</p>

<div>
Jordie Shier<sup>1</sup>, Charalampos Saitis<sup>1</sup>, Andrew Robertson<sup>2</sup>, and Andrew McPherson<sup>3</sup>
<div style="font-size:small">
  <sup>1</sup>Centre for Digital Music, Queen Mary University of London<br/>
  <sup>2</sup>Ableton AG<br />
  <sup>3</sup>Dyson School of Design Engineering, Imperial College London<br/>
</div>
</div>

<hr />

<div align="left">
    <a href="https://github.com/jorshi/ddsp-timbre-remap"><i class="fab fa-github"></i> <b>Training Code</b></a> | <a href="https://drive.google.com/file/d/1m-fi_L9U__gK7VpXv2tWOnBkRhUej08r/view?usp=drive_link"><i class="fas fa-headphones"></i> <b>Audio Plugin</b></a> | <a href="https://colab.research.google.com/drive/1nwV5y2eYiCF9YIM1BSmKU9uiPBbw9OxV?usp=sharing"><i class="fas fa-laptop-code"></i> <b>Google Colab</b></a> | <a href="https://arxiv.org/abs/2407.04547"><i class="fas fa-paperclip"></i> <b>Paper</b></a>
</div>

<hr />

## What is TorchDrum?

TorchDrum is an open-source audio plugin that transforms input signals into a synthesised 
808 drum in real-time. The rhythm, loudness, and timbral variations from a percussive
input signal are mapped to synthesiser controls, allowing for dynamic, audio-based
control. The figure above shows the main signal flow implemented in the audio plug-in, which was
built in C++ using JUCE.

{% include figure.html path="assets/img/adc2024/real-time-slide.jpg" title="Real-time Plugin Oveview" class="img-fluid rounded z-depth-1" width="100%" %}

<br/>
 The main signal processing and mapping components are:
- 1) **Onset Detection**: drum hits in the input signal are detected using an onset detection
algorithm. This allows the rhythm from the input to be mapped to the synthesiser.
- 2) **Feature Extraction**: a short segment of audio is extracted from the input signal for
feature extraction. We only use 256 samples which is ~5.3ms (48kHz sampling rate), this
minimises the delay between a detected onset and triggering the synth. This segment of 256
samples is passed into an audio feature extractor that measures the loudness, spectral centroid (brightness),
and spectral flatness (noisiness) of the input.
- 3) **Parameter Mapping Neural Network**: These audio features are then passed into a
neural network that has been trained to produce synthesiser parameter modulations for the
808 synthesiser so the output follows the variations in loudness and timbre observed at
the input.

We refer to the process of automatically updating synthesiser parameters to reflect the timbral
variations in the input signal as *timbre remapping*.
<br/>
<hr />

## What is Timbre Remapping?

Timbre remapping involves the analysis and transfer of timbre from an audio input onto
controls for a synthesizer. To achieve timbre remapping we consider musical phrases where
timbre changes from note to note. We look at the *differences in timbre* (and loudness) between
notes and try to recreate those differences on our synthesiser. The process
is similar to transposing a melody into a different key, but instead of pitch, we are dealing
with melodies of timbre and loudness, and are transposing from an input instrument onto
synthesiser.

Let's make this a bit more concrete. Here is an example of a short snare drum phrase
with plots of the timbre and loudess for each hit. The arrow shows differences between each note
compared to the first note in the phrase.
<iframe width="770" height="440" src="https://www.youtube.com/embed/X8ivQVtUQQc?si=bO6a6xFqT-2sFDlX&loop=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Here's the same snare drum phase (without the rhythm) followed by all the differences
in timbre and loudness mapped onto a synthesiser. What we end up is a new a synthesiser
sound (a modulated preset) for each hit in the input phrase.
<iframe width="770" height="440" src="https://www.youtube.com/embed/cdY3EB3O7TM?si=GGN6hkTJd0HjTJhh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />
<hr />

## How does the Parameter Mapping Neural Network Work?

The neural network enables real-time timbre remapping, allowing for input signals to be
transformed with low-latency. The neural network we use is relatively small, but it contains
non-linearities, allowing for complex relationships between input features and parameters
to be formed. 

The neural network is trained to generate synthesiser parameters
to match the loudness and timbral changes over full the full length of a drum hit (~1 second).
During real-time operation we can't wait a full second to see how the input sound
fully evolves, so we predict parameters based on short segments of audio at detected
onsets.

We also employ a recent method called *differentiable digital signal processing* (DDSP),
which enables DSP algorithms to be integrated directly into gradient-descent based optimization
used to train neural networks. Practically speaking, this allows us to compute training
error on the audio output of our synthesiser using loudness and timbral features.
We don't need to know the parameters for our timbre remapping ahead of time -- we only
need our input audio which we use during *self-supervised* training.

This figure outlines the training process:

{% include figure.html path="assets/img/adc2024/neural-net-training.jpg" title="Neural Network Training" class="img-fluid rounded z-depth-1" width="100%" %}
<br />
The main takeaway from the figure is that we're training the neural network to match
*differences* in audio features between two difference hits. $$y = f(x_a) - f(x_b)$$
is the difference between two different sounds in an input, and $$\hat{y} = f(x_c) - f(x_d)$$
is the difference between a synthesiser preset and a modulated version of that
preset. The goal of the neural network is create a parameter modulation $$\theta_{mod}$$
so that $$y = \hat{y}$$. Furthermore, the neural network is trained to make this prediction
from onset features $$f_o(\cdot)$$ to allow for real-time parameter prediction.

<br />
<hr />

## Creating a Plugin

Neural network training is conducted using PyTorch

<br />
<hr />

## Plugin Overview

<div class="image-container">
    {% include figure.html path="assets/img/adc2024/plugin-ui.jpg" title="MLP Parameter Mapping Overview" class="img-fluid rounded z-depth-1" width="100%" %}

  <!-- Plus buttons -->
<div class="plus-button" data-info="Audio features are extracted from input audio at detected onsets. These features (visualized in the radar plot) are passed as input to a neural network, which generates modulations for synthesis parmeters." style="top: 12%; left: 37%;">+</div>
    <div class="plus-button" data-info="The drum synthesizer is modeled on an 808 snare drum. These parameters modify the sound and are modulated by a neural network. The inner ring controls the parameter value outer ring displays the modulation applied by the neural net." style="top: 15%; left: 67%;">+</div>
    <div class="plus-button" data-info="Onset detection is used to detect percussive events in input audio. The graph shows the amplitude envelope of the input and controls below are used to adjust detection parameters." style="top: 65%; left: 45%;">+</div>
    <div class="plus-button" data-info="Global controls. Dry/Wet allows for mixing of input audio and the drum synth. 'Neurality' is the strength of the neural network modulation -- zero is no modulation and increasing values lead to more extreme reaction to the input" style="top: 67%; left: 7%;">+</div>
    <div class="plus-button" data-info="Load a preset and modulation neural network. Neural network models are trained offline to react to input audio and modulate parameters of a preset to match the dynamic and timbral expression of a performance. Train your own models on Google Colab or experiment with pre-trained models." style="top: 5%; left: 2%;">+</div>
  <!-- Add more plus buttons as needed -->
</div>

<!-- Information Box -->
<div id="info-box" style="display: none;">
  <p id="info-content"></p>
  <button onclick="closeInfo()">Close</button>
</div>

<br />
## What is TorchDrum?

<iframe width="770" height="440" src="https://www.youtube.com/embed/IVaNfp4rev0?si=_Ja3pAfqm_34z5bH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>