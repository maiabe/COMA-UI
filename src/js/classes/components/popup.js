class Popup {
    constructor(width, height, initialTop, initialLeft, key, color, content) {

        this.content = content;

        // HTML elements
        this.element;
        this.header;
        this.headerTitle;
        this.body;

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

        this.setState(this.idle);
        this.createHTMLElement();
        this.setInitialValues();
        this.setEventListeners();

        // Drag Position Array
        this.mousePositions = [];

    }

    createHTMLElement = () => {
        this.element = GM.HF.createNewDiv(`popup-${this.key}`, `popup-${this.key}`, ['popup'], []);
        this.createHeader();
        this.body = GM.HF.createNewDiv(`popup-body-${this.key}`, `popup-body-${this.key}`, ['popupBody'], []);
        this.element.appendChild(this.header);
        this.element.appendChild(this.body);
        this.setBodyContent(this.content);
        document.body.appendChild(this.element);
    }

    createHeader = () => {
        this.header = GM.HF.createNewDiv(`popup-header-${this.id}`, `popup-header-${this.id}`, ['popupHeader'], [{style: 'backgroundColor', value: this.headerColor}]);
        this.headerTitle = GM.HF.createNewParagraph('', '', ['popupHeaderTitle'], [], 'This Is A Popup Header');
        this.header.appendChild(this.headerTitle);
        const closeIcon = GM.HF.createNewDiv('', '', ['closePopupIcon'], []);
        const img = GM.HF.createNewIMG('', '', 'images/icons/cancel.png', [], [], 'Close Popup Button');
        closeIcon.appendChild(img);
        closeIcon.addEventListener('click', this.close);
        this.header.appendChild(closeIcon);
    }

    setBodyContent = content => {
        this.#clearBodyContent();
        this.body.appendChild(content);
    };

    #clearBodyContent = () => {
        this.body.innerHTML = '';
    }

    setInitialValues = () => {
        this.element.style.width = this.width;
        this.element.style.height = this.height;
        this.setTop();
        this.setLeft();
    };

    setTop = () => {
        this.element.style.top = `${this.top}px`;
    }

    setLeft = () => {
        this.element.style.left = `${this.left}px`;
    };

    setEventListeners = () => {
        this.header.addEventListener('mousedown', this.startDrag);
        this.header.addEventListener('mouseup', this.endDrag);
        this.header.addEventListener('mouseleave', this.endDrag);
        this.header.addEventListener('mousemove', e => {
            this.drag(e);
            e.preventDefault();
        });
    };

    setState = state => {
        this.state = state;
    }

    getState = () => { return this.state };

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
            if (this.mousePositions.length > 2) {
                const far = this.mousePositions[this.mousePositions.length - 1];
                const near = this.mousePositions[0];
                this.mousePositions = [this.mousePositions[this.mousePositions.length - 1]];
                const distance = { x: far.x - near.x, y: far.y - near.y };
                this.top += distance.y;
                this.left += distance.x;
                this.setLeft();
                this.setTop();
            }
        }
    }

    close = () => {
        document.body.removeChild(this.element);
        GM.PM.destroyPopup(this.key);
    }
}