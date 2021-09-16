class Popup {
    constructor(width, height, initialTop, initialLeft, id, startInvisible) {
        // HTML elements
        this.element;
        this.header;
        this.headerTitle;
        this.body;

        // ID
        this.id = id;

        // Initial CSS Values
        this.top = initialTop;
        this.left = initialLeft;
        this.width = width;
        this.height = height;

        // State Variables
        this.state;
        this.idle = 0;
        this.dragging = 1;

        this.visible = startInvisible;

        this.setState(this.idle);
        this.createHTMLElement();
        this.setInitialValues();
        this.setEventListeners();
        this.toggleVisibility();

        // Drag Position Array
        this.mousePositions = [];

    }

    createHTMLElement = () => {
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.classList.add('popup');

        this.createHeader();

        this.body = document.createElement('div');
        this.body.id = `${this.id}Body`;
        this.body.classList.add('popupBody');

        this.element.appendChild(this.header);
        this.element.appendChild(this.body);
        document.body.appendChild(this.element);
    }

    createHeader = () => {
        this.header = document.createElement('div');
        this.header.id = `${this.id}Header`;
        this.header.classList.add('popupHeader');
        this.headerTitle = document.createElement('p');
        this.headerTitle.classList.add('popupHeaderTitle');
        this.setHeaderTitle('This Is A Header Title');
        this.header.appendChild(this.headerTitle);
        const closeIcon = document.createElement('div');
        closeIcon.classList.add('closePopupIcon');
        this.header.appendChild(closeIcon);
        const img = document.createElement('img');
        img.src = 'images/icons/cancel.png';
        closeIcon.appendChild(img);
        closeIcon.addEventListener('click', this.close);
    }

    setHeaderTitle = string => {
        this.headerTitle.innerHTML = string;
    }

    setBodyContent = content => {
        this.clearBodyContent();
        this.body.appendChild(content);
    };

    clearBodyContent = () => {
        this.body.innerHTML = '';
    }

    setInitialValues = () => {
        this.element.style.width = this.width;
        this.element.style.height = this.height;
        this.setTop();
        this.setLeft();
    };

    setTop = () => {
        this.element.style.top = this.top;
    }

    setLeft = () => {
        this.element.style.left = this.left;
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
        console.log('start');
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

    toggleVisibility = () => {
        let display = 'block';
        if (this.visible) {
            display = 'none';
        }
        this.visible = !this.visible;
        this.element.style.display = display;
        this.setState(this.idle);
    }


    open = (top, left) => {
        this.visible = false;

        if (top && left) {
            if (typeof(top) == 'string') {
                console.log(top);
                this.top = this.convertVHtoPX(top);
            } else {
                this.top = top;
            }
            if (typeof(left) == 'string') {
                this.left = this.convertVWtoPX(left);
            } else {
                this.left = left;
            }
            this.setTop();
            this.setLeft();
        }

        this.toggleVisibility();
    }

    setHeaderColor = color => {
        this.header.style.backgroundColor = color;
    }

    convertVHtoPX = vh => {
        const val = vh.split('vh');
        const n = parseFloat(val);
        return window.innerHeight / 100 * n;
    }

    convertVWtoPX = vw => {
        const val = vw.split('vw');
        const n = parseFloat(val);
        return window.innerWidth / 100 * n;
    }

    close = () => {
        this.visible = true;
        this.toggleVisibility();
        this.clearBodyContent();
    }

    destroy = () => {
        delete(this);
    }
}