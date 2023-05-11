---
layout: page
title: Differentiable Modeling of Percussive Audio with Transient and Spectral Synthesis
description: 
img: assets/img/research/onset-synth.jpg
importance: 1
category: research
---

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/research/drumblender.jpg" title="example image" class="img-fluid rounded z-depth-1" width="100%" %}
    </div>
</div>


## Results
<hr />

Here we share resynthesis results from our method on a selection of acoustic and
electronic drum set sounds from our test set. $$Y$$ is the ground truth audio target,
$$S$$ is sinudoial only using sinusoidal modeling, $$S + N$$ is sines plus noise with a
learned noise encoder and generator, and $$T(S) + N$$ uses the learned transient
encoder and modulated TCN network conditioned with a sinusoidal input and noise is
summed at the ouput.


| Target           | $$Y$$                                                                                                         | $$S$$ | $$S + N$$ | $$T(S) + N$$ |
|---|---|---|---|---|
| Acoustic Kick    | <audio controls class="player"><source src="/assets/audio/drumblender/a_kick.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_kick_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_kick_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_kick_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
| Acoustic Snare   | <audio controls class="player"><source src="/assets/audio/drumblender/a_snare.mp3" type="audio/mpeg"></audio> | <audio controls class="player"><source src="/assets/audio/drumblender/a_snare_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_snare_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_snare_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
| Acoustic Tom     | <audio controls class="player"><source src="/assets/audio/drumblender/a_tom.mp3" type="audio/mpeg"></audio>   | <audio controls class="player"><source src="/assets/audio/drumblender/a_tom_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_tom_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_tom_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  | 
| Acoustic Hihat   | <audio controls class="player"><source src="/assets/audio/drumblender/a_hihat.mp3" type="audio/mpeg"></audio> | <audio controls class="player"><source src="/assets/audio/drumblender/a_hihat_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_hihat_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_hihat_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
| Acoustic Crash   | <audio controls class="player"><source src="/assets/audio/drumblender/a_crash.mp3" type="audio/mpeg"></audio> | <audio controls class="player"><source src="/assets/audio/drumblender/a_crash_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_crash_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/a_crash_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
| Electronic Kick  | <audio controls class="player"><source src="/assets/audio/drumblender/e_kick.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_kick_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_kick_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_kick_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
| Electronic Snare | <audio controls class="player"><source src="/assets/audio/drumblender/e_snare.mp3" type="audio/mpeg"></audio> | <audio controls class="player"><source src="/assets/audio/drumblender/e_snare_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_snare_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_snare_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
| Electronic Tom   | <audio controls class="player"><source src="/assets/audio/drumblender/e_tom.mp3" type="audio/mpeg"></audio>   | <audio controls class="player"><source src="/assets/audio/drumblender/e_tom_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_tom_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_tom_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  | 
| Electronic Hihat | <audio controls class="player"><source src="/assets/audio/drumblender/e_hihat.mp3" type="audio/mpeg"></audio> | <audio controls class="player"><source src="/assets/audio/drumblender/e_hihat_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_hihat_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_hihat_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
| Electronic Crash | <audio controls class="player"><source src="/assets/audio/drumblender/e_crash.mp3" type="audio/mpeg"></audio> | <audio controls class="player"><source src="/assets/audio/drumblender/e_crash_modal.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_crash_noise_params.mp3" type="audio/mpeg"></audio>  | <audio controls class="player"><source src="/assets/audio/drumblender/e_crash_noise_parallel_transient_params.mp3" type="audio/mpeg"></audio>  |
