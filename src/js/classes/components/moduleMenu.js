class ModuleMenu {
    constructor() {
        this.menuContainer = document.getElementById('moduleMenu');
        this.sourceSubMenuItems = [
            {icon: 'images/icons/sql-open-file-format.png', text: 'SQL', category: 'Source'},
            {icon: 'images/icons/files.png', text: 'FITS', category: 'Source'},
            {icon: 'images/icons/csv-file-format-extension.png', text: 'CSV', category: 'Source'},
            {icon: 'images/icons/data-random-squares.png', text: 'Random', category: 'Source'},
            {icon: 'images/icons/json-file.png', text: 'JSON', category: 'Source'},
            {icon: 'images/icons/axis.png', text: 'Ephemeris', category: 'Source'},
            {icon: 'images/icons/calendar.png', text: 'MJD', category: 'Source'},
            {icon: 'images/icons/truck.png', text: 'All', category: 'Source'}
        ];
        this.processorSubMenuItems = [
            {icon: 'images/icons/function.png', text: 'Function', category: 'Processor'},
            {icon: 'images/icons/gaussian-function.png', text: 'Gaussian Filter', category: 'Processor'},
            {icon: 'images/icons/filter.png', text: 'Laplacian Filter', category: 'Processor'}
        ];
        this.outputSubMenuItems = [
            {icon: 'images/icons/scatter-graph.png', text: 'Scatter Plot', category: 'Output'},
            {icon: 'images/icons/bar-chart.png', text: 'Bar Chart', category: 'Output'},
            {icon: 'images/icons/line-chart.png', text: 'Line Chart', category: 'Output'},
            {icon: 'images/icons/table.png', text: 'Table', category: 'Output'},
            {icon: 'images/icons/image.png', text: 'Image', category: 'Output'}
        ];
        this.moduleTypes = [
            {text: 'Source', color: '#1abd1a', subMenuItems: this.sourceSubMenuItems, subMenu: null, buttonIcon: 'images/icons/database-storage.png'}, 
            {text: 'Processor', color: '#d40606', subMenuItems:this.processorSubMenuItems, subMenu: null, buttonIcon: 'images/icons/calculator.png'}, 
            {text: 'Output', color: '#2e77ff', subMenuItems: this.outputSubMenuItems, subMenu: null, buttonIcon: 'images/icons/scatter-graph.png'}];
        this.topMenuButtonArray = [];
        this.initializeMenu();
    };

    initializeMenu = () => {
        this.moduleTypes.forEach(m => {
            const button = new ModuleTopButton(m);
            this.topMenuButtonArray.push(button.getElement());
            this.menuContainer.append(button.getElement());
        });
    }
}

class ModuleTopButton {
    constructor(module) {
        this.wrapperElement;
        this.buttonElement;
        this.text = module.text;
        this.color = module.color;
        this.image = module.buttonIcon;
        this.subMenu;
        this.createButton(module.subMenuItems);
    };

    createButton = (subMenuItems) => {
        this.wrapperElement = document.createElement('div');
        this.wrapperElement.classList.add('menuSegmentWrapper');
        this.buttonElement = document.createElement('div');
        this.buttonElement.classList.add('topMenuButton');
        const icon = document.createElement('img');
        icon.src = this.image;
        this.buttonElement.append(icon);
        const paragraph = document.createElement('p');
        paragraph.innerHTML = this.text;
        this.buttonElement.append(paragraph);
        this.buttonElement.style.backgroundColor = this.color;
        this.wrapperElement.append(this.buttonElement);
        // Create The sub Menu
        this.subMenu = new ModuleSubMenu(this.text, subMenuItems);
        this.wrapperElement.append(this.subMenu.getWrapperElement());
        this.buttonElement.addEventListener('click', this.subMenu.toggleMenu);
    };
    
    getElement = () => {
        return this.wrapperElement;
    };
}   

class ModuleSubMenu {
    constructor (name, dataArray) {
        this.name = name;
        this.dataArray = dataArray;
        this.maxHeight = 0;
        this.open = false;
        this.wrapperElement;
        this.cardArray = [];
        this.createSubMenu();
    }

    createSubMenu = () => {
        this.wrapperElement = document.createElement('div');
        this.wrapperElement.classList.add('subMenuWrapper');
        this.maxHeight = Math.ceil(this.dataArray.length / 3) * 100 + 'px';

        this.dataArray.forEach(e => {
            const card = new SubMenuCard(e);
            this.cardArray.push(card);
            this.wrapperElement.append(card.getElement());
        });
        this.wrapperElement.style.height = `${this.maxHeight}}px`;
    };

    toggleMenu = () => {
        console.log(this.maxHeight);
        const height = this.open ? 0 : this.maxHeight;
        const paddingTop = this.open ? '0%' : '1%';
        const paddingBottom = this.open ? '0%' : '1%';
        this.open = !this.open;
        this.wrapperElement.style.height = height;
        this.wrapperElement.style.paddingTop = paddingTop;
        this.wrapperElement.style.paddingBottom = paddingBottom;
    };

    getWrapperElement = () => {
        return this.wrapperElement;
    }
}

class SubMenuCard {
    constructor(data) {
        this.icon = data.icon;
        this.text = data.text;
        this.category = data.category;
        this.element;
        this.textArea;
        this.image;
        this.createCard();
    };
    createCard = () => {
        this.element = document.createElement('div');
        this.element.classList.add('menuIconCard');
        this.image = document.createElement('img');
        this.image.src = this.icon;
        this.element.append(this.image);
        this.textArea = document.createElement('div');
        this.textArea.classList.add('iconText');
        this.textArea.innerHTML = this.text;
        this.element.append(this.textArea);
        this.element.addEventListener('click', this.clickHandler);
    };
    getElement = () => {
        return this.element;
    };
    clickHandler = () => {
        ENV.deployNewModule(this.text, this.category);
    };
}