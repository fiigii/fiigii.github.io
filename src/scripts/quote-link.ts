class QuoteLink extends HTMLElement {
  static get observedAttributes() {
    return ["href"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const href = this.getAttribute("href") || "#";
    this.style.display = "inline";
    this.innerHTML = `
      <a href="${href}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-size: 12px; transform: translateY(-6px); display: inline-flex; align-items: baseline; border: none;">
        <span>[</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 12px; height: 12px;">
          <path d="M19.417 6.679C20.447 7.773 21 9 21 10.989c0 3.5-2.457 6.637-6.03 8.188l-.893-1.378c3.335-1.804 3.987-4.145 4.247-5.621-.537.278-1.24.375-1.929.311C14.79 12.34 13.5 10.98 13.5 9.3c0-1.714 1.343-3.1 3-3.1.872 0 1.676.372 2.258.98zM8.917 6.679C9.947 7.773 10.5 9 10.5 10.989c0 3.5-2.457 6.637-6.03 8.188l-.893-1.378c3.335-1.804 3.987-4.145 4.247-5.621-.537.278-1.24.375-1.929.311C4.29 12.34 3 10.98 3 9.3c0-1.714 1.343-3.1 3-3.1.872 0 1.676.372 2.258.98z"/>
        </svg>
        <span>]</span>
      </a>`;
  }
}
customElements.define("q-l", QuoteLink);
