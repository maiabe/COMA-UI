export class RangeSlider {
    constructor() {
        this.slideBalls = [];
        this.backgroundBar = undefined;
        this.setStopDragEventListeners();
    }

    generateRangeSlider(id, name, classlist, customstyles) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('range-slider-wrapper');
        this.backgroundBar = this.createBackgroundbar();
        const leftSlideBall = this.createSlideBall('left');
        const rightSlideBall = this.createSlideBall('right');
        wrapper.appendChild(this.backgroundBar);
        wrapper.appendChild(leftSlideBall);
        wrapper.appendChild(rightSlideBall);
        return wrapper;
    }

    createBackgroundbar() {
        const bar = document.createElement('div');
        bar.classList.add('range-slider-background-bar');
        return bar;
    }

    createSlideBall(side) {
        const ball = document.createElement('div');
        if (side === 'left') ball.classList.add('range-slider-ball');
        else ball.classList.add('range-slider-ball-right');

        const ballObject = {
            element: ball,
            positionArray: [],
            dragging: false,
            leftOffset: 0,
            parentWidth: -1,
            parentLeft: -1,
            width: -1,
            side: side
        }
        this.slideBalls.push(ballObject);
        this.createSlideEventListeners(ballObject);
        return ball;
    }

    createSlideEventListeners(ballObject) {
        ballObject.element.addEventListener('mousedown', event => {
            this.beginDragging(event, ballObject);
        });
        document.addEventListener('mousemove', () => {
            this.drag(event, this.slideBalls.find(element => element.dragging === true))
        });
    }

    setStopDragEventListeners() {
        document.addEventListener('mouseup', () => {
            this.stopDragging(this.slideBalls.find(element => element.dragging === true));
        });
    }

    stopDragging = ballObject => {
        if (!ballObject) return;
        ballObject.dragging = false;
        ballObject.positionArray = [];
    }
    beginDragging = (event, ballObject) => {
        ballObject.dragging = true;
        ballObject.leftOffset = this.calcLeftOffest(event, ballObject.element)
        ballObject.parentWidth = this.getBarWidth();
        ballObject.parentLeft = this.getBarLeft();
        ballObject.width = ballObject.element.getBoundingClientRect().width;
    }
    drag = (event, ballObject) => {
        if (!ballObject) return;
        if (ballObject.dragging && this.isDragInBounds(event.clientX, ballObject)) {
            const dragToPosition = event.clientX - ballObject.leftOffset - ballObject.parentLeft
            ballObject.element.style.left = `${dragToPosition}px`;
        }
    }

    calcLeftOffest = (event, element) => {
        return event.clientX - element.getBoundingClientRect().left + window.pageXOffset || document.documentElement.scrollLeft;
    }

    isDragInBounds(mouseLeft, ballObject) {
        return mouseLeft - ballObject.leftOffset > ballObject.parentLeft;
    }

    getBarWidth = () => this.backgroundBar.getBoundingClientRect().width;
    getBarLeft = () => this.backgroundBar.getBoundingClientRect().left + window.pageXOffset || document.documentElement.scrollLeft;
    getBallLeft = ball => ball.getBoundingClientRect().left + window.pageXOffset || document.documentElement.scrollLeft;
}