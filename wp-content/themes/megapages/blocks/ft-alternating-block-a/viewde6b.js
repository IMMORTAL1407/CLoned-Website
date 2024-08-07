/**
 * Frontend scripting for the alternating feature type A block.
 */

class FeatureAlternatingBlockA {
    blockA;
    videos;

    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.blockA = element;
        this.videos = this.blockA.querySelectorAll('video');

        for (const video of this.videos) {
            if (video.loop) {
                VideoPauser.instance.registerVideo(video);
            }
        }
    }
}
