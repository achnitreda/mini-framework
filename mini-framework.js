// @ts-check

const MiniFramework = {
    // DOM Abstraction
    /**
     * Creates a virtual DOM element
     * @param {string} tag - HTML tag name
     * @param {Object} attrs - Attributes for the element
     * @param {...any} children - Child elements or text
     * @returns {Object} Virtual DOM node
     */
    createElement(tag, attrs = {}, ...children) {
        return { tag, attrs, children: children.flat(Infinity).filter(child => child != null) }
    },

    /**
     * Creates a real dom element from virtual dom node
     * (In some frameworks, this is called "mount")
     * @param {Object|string|number|boolean|bigint|symbol} vNode - Virtual Dom node
     * @returns {HTMLElement|Text} Real DOM node
     */
    createRealElement(vNode) {
        if (typeof vNode !== "object") {
            return document.createTextNode(String(vNode))
        }

        const element = document.createElement(vNode.tag)

        for (const [attr, value] of Object.entries(vNode.attrs || {})) {
            if (attr.startsWith('on')) {
                const eventName = attr.slice(2).toLowerCase()
                element.addEventListener(eventName, value)
            } else if (attr === 'ref') {
                // Handle ref attribute for getting references to DOM elements
                value(element)
            } else {
                element.setAttribute(attr, value)
            }
        }

        // Add children recursively
        for (const child of vNode.children || []) {
            element.appendChild(this.createRealElement(child))
        }

        return element
    },


    /**
     * Store the current Virtual DOM tree for each container
     * @type {Map<HTMLElement,Object>}
     */
    _vDomTrees: new Map(),


    /**
     * Deep clones  a virtual DOM node to prevent reference issues
     * @param {Object|string|number|boolean|null|undefined} node - Node to clone
     * @returns {Object|string|number|boolean|null|undefined} Cloned node
     */
    _deepCloneVNode(node) {
        if (node == null || typeof node !== 'object') {
            return node;
        }

        // Clone the node
        const clone = { tag: node.tag };

        if (node.attrs) {
            clone.attrs = {};
            for (const [key, value] of Object.entries(node.attrs)) {
                clone.attrs[key] = value;
            }
        }

        if (node.children) {
            clone.children = node.children.map(child => this._deepCloneVNode(child))
        }

        return clone
    },

    /**
     * Renders a virtual DOM tree to a container using efficient diffing
     * @param {Object} vNode - Virtual DOM node
     * @param {HTMLElement} container - Container to render into
     */
    render(vNode, container) {
        const oldVNode = this._vDomTrees.get(container)

        if (!oldVNode) {
            container.innerHTML = ''
            container.appendChild(this.createRealElement(vNode))
        } else {
            this.updateElement(container, vNode, oldVNode, 0)
        }

        this._vDomTrees.set(container, this._deepCloneVNode(vNode))
    },

    /**
     * Compares two nodes to determine if they are different
     * @param {Object|string|number|boolean|null|undefined} node1 - First node
     * @param {Object|string|number|boolean|null|undefined} node2 - Second node
     * @returns {boolean} True if nodes are different
     */
    changed(node1, node2) {
        if (node1 == null || node2 == null) return node1 != node2

        if (typeof node1 !== typeof node2) return true

        if (typeof node1 !== 'object') return node1 !== node2

        return node1.tag !== node2.tag
    },

    /**
     * Updates DOM elements based on Virtual DOM differences (Diffing & Patching)
     * @param {HTMLElement} parent - Parent element
     * @param {Object|string|number|boolean|null|undefined} newNode - New Virtual Node
     * @param {Object|string|number|boolean|null|undefined} oldNode - Old Virtual Node
     * @param {number} index - Index of child in parent
     */
    updateElement(parent, newNode, oldNode, index = 0) {
        if (oldNode == null) {
            parent.appendChild(this.createRealElement(newNode))
            return
        }

        if (newNode == null) {
            parent.removeChild(parent.childNodes[index])
            return
        }

        if (this.changed(newNode, oldNode)) {
            parent.replaceChild(this.createRealElement(newNode), parent.childNodes[index])
            return
        }

        if (typeof newNode !== 'object' || typeof oldNode !== 'object') {
            return;
        }

        // At this point we know both nodes are objects with the same tag

        /** 
         * @type {HTMLElement} 
         * => I skip this because I know for sure that I have Node element
         */
        // @ts-ignore
        const el = parent.childNodes[index]

        const newAttrs = newNode.attrs || {}
        const oldAttrs = oldNode.attrs || {}

        for (const [attr, value] of Object.entries(newAttrs)) {
            if (attr.startsWith('on') && !(attr in oldAttrs)) {
                const eventName = attr.slice(2).toLowerCase()
                el.addEventListener(eventName, value)
            } else if (oldAttrs[attr] !== value) {
                el.setAttribute(attr, value)
            }
        }

        for (const attr in oldAttrs) {
            if (attr.startsWith('on')) {
                const eventName = attr.slice(2).toLowerCase()
                // Remove old handler if it doesn't exist in new attributes or is different
                if (!(attr in newAttrs)) {
                    el.removeEventListener(eventName, oldAttrs[attr])
                } else if (oldAttrs[attr] !== newAttrs[attr]) {
                    el.removeEventListener(eventName, oldAttrs[attr])
                    el.addEventListener(eventName, newAttrs[attr])
                }
            } else if (!(attr in newAttrs)) {
                el.removeAttribute(attr)
            }
        }

        const newChildren = newNode.children || []
        const oldChildren = oldNode.children || []
        const maxLength = Math.max(newChildren.length, oldChildren.length)

        for (let i = 0; i < maxLength; i++) {
            this.updateElement(
                el,
                i < newChildren.length ? newChildren[i] : null,
                i < oldChildren.length ? oldChildren[i] : null,
                i
            )
        }
    },
}