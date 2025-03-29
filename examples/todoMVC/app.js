const button = MiniFramework.createElement('button', { 
    class: 'btn',
    onClick: (e) => {
      console.log('Button clicked!', e);
    }
  }, 'Click me');

const vNode = MiniFramework.createElement('div', { class: 'container' },
    MiniFramework.createElement('h1', { class: 'title' }, 'Hello MiniFramework'),
    MiniFramework.createElement('p', { class: 'content' }, 'This is a paragraph'),
    MiniFramework.createElement('button', {
        class: 'btn primary',
        id: 'submit-btn',
        disabled: true,
        style: 'background-color: blue; color: white;'
    }, 'Click me'),
    MiniFramework.createElement('div', { class: 'card' },
        MiniFramework.createElement('div', { class: 'card-header' },
            MiniFramework.createElement('h2', {}, 'Card Title')
        ),
        MiniFramework.createElement('div', { class: 'card-body' },
            MiniFramework.createElement('p', {}, 'Card content goes here'),
            MiniFramework.createElement('button', {
                class: 'btn',
                onClick: () => alert('Button clicked')
            }, 'Click me')
        )
    ),
    button,
);

// Render to DOM
const appContainer = document.getElementById('app')
MiniFramework.render(vNode, appContainer);


