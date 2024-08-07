/**
 * Frontend scripting for the single slice feature module.
 */

class SingleSlice {
    singleSlice;
    videos;

    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.singleSlice = element;
        this.videos = this.singleSlice.querySelectorAll('video');

        for (const video of this.videos) {
            if (video.loop) {
                VideoPauser.instance.registerVideo(video);
            }
        }
    }
}
