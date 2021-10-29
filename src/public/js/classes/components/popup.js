class Popup {
    constructor(width, height, initialTop, initialLeft, key, color, content, headerText) {

        this.content = content;

        // HTML elements
        this.element;
        this.header;
        this.headerTitle;
        this.body;
        this.resizeDiv;

        // ID
        this.key = key;

        // Initial CSS Values
        this.top = initialTop;
        this.left = initialLeft;
        this.width = width;
        this.height = height;
        this.headerColor = color;

        // State Variables
        this.state;
        this.idle = 0;
        this.dragging = 1;
        this.resizing = 2;

        this.setState(this.idle);
        this.createHTMLElement(headerText);
        this.setInitialValues();
        this.setEventListeners();

        // Drag Position Array
        this.mousePositions = [];
    }

    createHTMLElement = headerText => {
        this.element = GM.HF.createNewDiv(`popup-${this.key}`, `popup-${this.key}`, ['popup'], []);
        this.createHeader(headerText);
        this.body = GM.HF.createNewDiv(`popup-body-${this.key}`, `popup-body-${this.key}`, ['popupBody'], []);
        this.element.appendChild(this.header);
        this.element.appendChild(this.body);
        this.setBodyContent(this.content);
        document.body.appendChild(this.element);
        this.createResizeDiv();
    }

    createHeader = headerText => {
        this.header = GM.HF.createNewDiv(`popup-header-${this.id}`, `popup-header-${this.id}`, ['popupHeader'], [{style: 'backgroundColor', value: this.headerColor}]);
        this.headerTitle = GM.HF.createNewParagraph('', '', ['popupHeaderTitle'], [], headerText);
        this.header.appendChild(this.headerTitle);
        const closeIcon = GM.HF.createNewDiv('', '', ['closePopupIcon'], []);
        const img = GM.HF.createNewIMG('', '', 'images/icons/cancel.png', [], [], 'Close Popup Button');
        closeIcon.appendChild(img);
        closeIcon.addEventListener('click', this.close);
        this.header.appendChild(closeIcon);
    }

    createResizeDiv = () => {
        this.resizeDiv = GM.HF.createNewDiv(`popup-resize-${this.id}`, `popup-resize-${this.id}`, ['popupResize'], []);
        this.body.appendChild(this.resizeDiv);
    }

    setBodyContent = content => {
        this.#clearBodyContent();
        this.body.appendChild(content);
    };

    #clearBodyContent = () => {
        this.body.innerHTML = '';
    }

    setInitialValues = () => {
        this.setWidth();
        this.setHeight();
        this.setTop();
        this.setLeft();
    };

    setWidth = () => {
        this.element.style.width = `${this.width}px`;
    }

    setHeight = () => {
        this.element.style.height = `${this.height}px`;
    }
    setTop = () => {
        this.element.style.top = `${this.top}px`;
    }

    setLeft = () => {
        this.element.style.left = `${this.left}px`;
    };

    setEventListeners = () => {
        // Drag And Drop Listeners
        this.header.addEventListener('mousedown', this.startDrag);
        this.header.addEventListener('mouseup', this.endDrag);
        this.header.addEventListener('mouseleave', this.endDrag);
        this.header.addEventListener('mousemove', e => {
            this.drag(e);
            e.preventDefault();
        });
        // Expand and Shrink Listeners
        this.resizeDiv.addEventListener('mousedown', this.startResize);
        this.resizeDiv.addEventListener('mouseup', this.endResize);
        this.resizeDiv.addEventListener('mouseleave', this.endResize);
        this.resizeDiv.addEventListener('mousemove', e => {
            this.resize(e);
            e.preventDefault();
        });
        this.element.addEventListener('click', () => {
            this.element.style.zIndex = GM.PM.getNextZIndex();
        });
    };

    setState = state => {
        this.state = state;
    }

    getState = () => { return this.state };

    //  DRAG AND DROP FUNCTIONS
    startDrag = () => {
        this.setState(this.dragging);
        this.mousePositions = [];
    };
    endDrag = () => {
        this.setState(this.idle);
        this.mousePositions = [];
    };

    drag = e => {
        if (this.getState() === this.dragging) {
            const pos = { x: e.screenX, y: e.screenY };
            this.mousePositions.push(pos);
            if (this.mousePositions.length > 1) {
                const far = this.mousePositions[this.mousePositions.length - 1];
                const near = this.mousePositions[0];
                this.mousePositions = [far];
                const distance = { x: far.x - near.x, y: far.y - near.y };
                this.top += parseInt(distance.y);
                this.left += parseInt(distance.x);
                this.setLeft();
                this.setTop();
            }
        }
    }

    // RESIZE FUNCTIONS
    startResize = () => {
        this.setState(this.resizing);
        this.mousePositions = [];
        GM.PM.startResizeEventHandler(this.key);
    };
    endResize = () => {
        this.setState(this.idle);
        this.mousePositions = [];
        GM.PM.resizeEventHandler(this.key);
    };

    resize = e => {
        if (this.getState() === this.resizing) {
            const pos = { x: e.screenX, y: e.screenY };
            this.mousePositions.push(pos);
            if (this.mousePositions.length > 1) {
                const far = this.mousePositions[this.mousePositions.length - 1];
                const near = this.mousePositions[0];
                this.mousePositions = [far];
                const distance = { x: far.x - near.x, y: far.y - near.y };
                this.height += parseInt(distance.y);
                this.width += parseInt(distance.x);
                this.setWidth();
                this.setHeight();
            }
        }
    }

    close = () => {
        document.body.removeChild(this.element);
        GM.PM.destroyPopup(this.key);
    }
}