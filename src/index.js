// Simple script to update the DOM
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #1976d2;">Lul Admin Panel</h1>
        <p>This is a simple test to see if JavaScript is working properly.</p>
        <button id="testButton" style="padding: 8px 16px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Click Me
        </button>
        <p id="clickResult"></p>
      </div>
    `;

    // Add event listener to the button
    const button = document.getElementById('testButton');
    const result = document.getElementById('clickResult');
    if (button && result) {
      button.addEventListener('click', () => {
        result.textContent = 'Button clicked at ' + new Date().toLocaleTimeString();
      });
    }
  }
}); 