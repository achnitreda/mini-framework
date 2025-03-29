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
     * Renders a virtual DOM tree to a container
     * @param {Object} vNode - Virtual DOM node
     * @param {HTMLElement} container - Container to render into
     */
    render(vNode, container) {
        container.innerHTML = ''
        container.appendChild(this.createRealElement(vNode))
    },

    /**
     * Compares two nodes to determine if they are different
     * @param {Object|string|number|boolean|null|undefined} node1 - First node
     * @param {Object|string|number|boolean|null|undefined} node2 - Second node
     * @returns {boolean} True if nodes are different
     */
    changed(node1, node2) {
        console.log("loading")
        return false
    }
}