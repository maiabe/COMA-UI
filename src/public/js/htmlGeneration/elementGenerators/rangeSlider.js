export class RangeSlider {
    constructor(id, name, classList, customstyles, callback, updateSliderFunction) {
        updateSliderFunction(this.updateFunction.bind(this));
        this.callback = callback;
        this.slideBalls = [];
        this.backgroundBar = undefined;
        this.wrapper = this.generateRangeSlider(id, name, classList, customstyles)
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
        const percent = side === 'left' ? 0 : 1;
        const ballObject = {
            element: ball,
            dragging: false,
            leftOffset: 0,
            parentWidth: this.getBarWidth(),
            parentPercentWidth: -1,
            parentLeft: this.getBarLeft(),
            width: ball.getBoundingClientRect().width,
            side: side,
            percent: percent
        }
        this.slideBalls.push(ballObject);
        this.createSlideEventListeners(ballObject);
        this.setParentPercentWidths();
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
        this.setParentPercentWidths();
    }
    drag = (event, ballObject) => {
        if (!ballObject) return;
        if (ballObject.dragging) {
            const dragToPosition = this.findDragToPosition(event.clientX, ballObject);
            this.moveBallToPosition(ballObject.element, dragToPosition);
            ballObject.percent = this.calculatePercentageFromEdge(ballObject);
            this.callback({ left: parseFloat(this.getBallOnLeftSide().percent.toFixed(3)), right: parseFloat(this.getBallOnRightSide().percent.toFixed(3)), callback: this.updateFunction.bind(this) });
        }
    }

    moveBallToPosition = (element, pos) => element.style.left = `${pos}px`;

    calcLeftOffest = (event, element) => {
        return event.clientX - element.getBoundingClientRect().left + window.pageXOffset || document.documentElement.scrollLeft;
    }

    isDragInBounds(mouseLeft, ballObject) {
        return this.checkLeftBound(mouseLeft, ballObject.leftOffset, ballObject.parentLeft)
            && this.checkRightBound(mouseLeft, ballObject.leftOffset, ballObject.width, ballObject.parentLeft, ballObject.parentWidth)
            && this.checkSecondBallBound(mouseLeft, ballObject.side, ballObject.leftOffset, ballObject.width);
    }

    findDragToPosition(mousePosition, ballObject) {
        if (this.isDragInBounds(mousePosition, ballObject)) return mousePosition - ballObject.leftOffset - ballObject.parentLeft;
        else return this.findBoundaryPosition(mousePosition, ballObject.leftOffset, ballObject.parentLeft, ballObject.width, ballObject.parentWidth, ballObject.side);
    }

    findBoundaryPosition(mousePosition, leftOffset, parentLeft, width, parentWidth, side) {
        if (!this.checkSecondBallBound(mousePosition, side, leftOffset, width)) {
            if (side === 'left') return this.getBallLeft(this.getBallOnRightSide().element) - parentLeft - width;
            else return this.getBallLeft(this.getBallOnLeftSide().element) + width - parentLeft;
        }
        else if (!this.checkLeftBound(mousePosition, leftOffset, parentLeft)) return 0;
        else return parentWidth - width;
    }

    checkLeftBound = (mouseLeft, leftOffset, parentLeft) => mouseLeft - leftOffset >= parentLeft;
    checkRightBound = (mouseLeft, leftOffset, width, parentLeft, parentWidth) => mouseLeft - leftOffset + width <= parentLeft + parentWidth;
    checkSecondBallBound(mouseLeft, side, leftOffset, width) {
        if (side === 'left') return this.checkLeftBallBounds(mouseLeft, leftOffset, width, this.getBallOnRightSide());
        else return this.checkRightBallBounds(mouseLeft, leftOffset, this.getBallOnLeftSide());
    }

    checkLeftBallBounds = (mouseLeft, leftOffset, width, other) => mouseLeft - leftOffset + width <= this.getBallLeft(other.element);
    checkRightBallBounds = (mouseLeft, leftOffset, other) => mouseLeft - leftOffset >= this.getBallLeft(other.element) + other.width;

    getBallOnLeftSide = () => this.slideBalls.find(e => e.side === 'left');
    getBallOnRightSide = () => this.slideBalls.find(e => e.side === 'right');

    getBarWidth = () => this.backgroundBar.getBoundingClientRect().width;
    getBarLeft = () => this.backgroundBar.getBoundingClientRect().left + window.pageXOffset || document.documentElement.scrollLeft;
    getBallLeft = ball => ball.getBoundingClientRect().left + window.pageXOffset || document.documentElement.scrollLeft;
    setParentPercentWidths() {
        this.slideBalls.forEach(ball => {
            ball.parentWidth = this.getBarWidth();
            ball.width = ball.element.getBoundingClientRect().width;
            ball.parentPercentWidth = ball.parentWidth - (2 * ball.width);

        });
    }
    calculatePercentageFromEdge(ballObject) {
        if (ballObject.side === 'left') {
            const right = this.getBallLeft(ballObject.element) + ballObject.width;
            const distanceTraveled = right - ballObject.parentLeft - ballObject.width;
            return distanceTraveled / ballObject.parentPercentWidth;
        } else {
            const left = this.getBallLeft(ballObject.element);
            const distanceTraveled = ballObject.parentLeft + ballObject.parentWidth - ballObject.width - left;
            return 1 - (distanceTraveled / ballObject.parentPercentWidth);
        }
    }

    calculateLeftBallPositionFromPercentage(percentage) {
        const ball = this.getBallOnLeftSide();
        const left = ball.parentPercentWidth * percentage;
        ball.percent = percentage;
        this.moveBallToPosition(ball.element, left);
    }

    calculateRightBallPositionFromPercentage(percentage) {
        const ball = this.getBallOnRightSide();
        const right = ball.parentPercentWidth * percentage + ball.width;
        ball.percent = percentage;
        this.moveBallToPosition(ball.element, right);
    }

    updateFunction(min, max) {
        this.setParentPercentWidths();
        this.calculateLeftBallPositionFromPercentage(min);
        this.calculateRightBallPositionFromPercentage(max);
    }

    getWrappper = () => this.wrapper;
}