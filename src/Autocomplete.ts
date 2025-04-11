import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

interface Character {
  name: string;
  birth_year: string;
  gender: string;
}

@customElement("star-wars-autocomplete")
export class StarWarsAutocomplete extends LitElement {
  static styles = css`
    main {
      display: flex;
      justify-content: "center";
      align-items: "center";
      height: 100vh;
    }
    .search-container {
      max-width: 440px;
      margin: auto;
      padding: 3rem;
      border-radius: 0.6rem;
      box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.075);
    }
    h1,
    h2 {
      margin-top: 0;
    }
    h1 {
      font-size: 2.25rem;
    }
    h2 {
      font-size: 1.5rem;
      color: #0058ff;
    }
    .input-container {
      position: relative;
      width: 100%;
    }
    input[type="text"] {
      width: 100%;
      padding: 0.5rem;
      font-size: 1rem;
      box-sizing: border-box;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 225px;
      overflow-y: scroll;
    }
    li {
      padding: 0.75rem;
      border-bottom: 1px solid #ccc;
      cursor: pointer;
    }
    li:hover {
      background-color: #f9f9f9;
    }
    .character-profile {
      padding: 1rem;
    }
    .profile-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .profile-icon span {
      font-weight: bold;
    }
    .highlight {
      background-color: yellow;
    }
    .no-results {
      margin-top: 0.25rem;
      font-style: italic;
      color: #888;
    }
    .spinner {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      border: 2px solid #ccc;
      border-top: 2px solid #000;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% {
        transform: translateY(-50%) rotate(0deg);
      }
      100% {
        transform: translateY(-50%) rotate(360deg);
      }
    }
    .clear-btn {
      padding: 4px 16px;
      text-transform: capitalize;
      background-color: red;
      color: #fff;
      border: none;
      border-radius: 1rem;
      margin-top: 1rem;
    }
    .footer {
      text-align: center;
    }
  `;

  @property({ type: Object }) state = {
    inputText: "",
    charactersResults: [] as Character[],
    selectedCharacter: null as Character | null,
    loading: false,
  };

  private debounceTimeout: number | undefined;

  private handleInputChange(e: Event): void {
    const inputText = (e.target as HTMLInputElement).value;
    this.state = { ...this.state, inputText };

    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = window.setTimeout(() => {
      this.searchCharacters();
    }, 500);
  }

  //update properties on select
  private handleSelect(char: Character): void {
    this.state = {
      ...this.state,
      selectedCharacter: char,
      charactersResults: [],
      inputText: "",
    };
  }

  //reset selection
  private handleClear() {
    this.state = {
      ...this.state,
      selectedCharacter: null,
    };
  }

  //api call
  private async searchCharacters(): Promise<void> {
    if (!this.state.inputText.trim()) {
      this.state = { ...this.state, charactersResults: [], loading: false };
      return;
    }

    this.state = { ...this.state, loading: true };
    try {
      const response = await fetch(
        `https://swapi.dev/api/people/?search=${this.state.inputText}`
      );
      const data = await response.json();
      this.state = { ...this.state, charactersResults: data.results };
    } catch (err) {
      console.error("Failed to fetch characters:", err);
    } finally {
      this.state = { ...this.state, loading: false };
    }
  }

  private highlightMatchingText(text: string) {
    const inputTextVal = this.state.inputText.trim();
    if (!inputTextVal) return text;

    const regex = new RegExp(`(${inputTextVal})`, "gi");
    const inputTextParts = text.split(regex);
    return inputTextParts.map((part) =>
      regex.test(part) ? html`<span class="highlight">${part}</span>` : part
    );
  }

  render() {
    return html`
      <main>
        <div class="search-container">
          <h1>Star Wars Characters</h1>
          <div class="input-container">
            <input
              type="text"
              placeholder="Search here..."
              .value=${this.state.inputText}
              @input=${this.handleInputChange.bind(this)}
            />
            ${this.state.loading ? html`<div class="spinner"></div>` : nothing}
          </div>
          <ul>
            ${!this.state.loading &&
            this.state.inputText &&
            this.state.charactersResults.length === 0
              ? html`<div class="no-results">No results found.</div>`
              : this.state.charactersResults.map(
                  (char) => html`
                    <li @click=${() => this.handleSelect(char)}>
                      ${this.highlightMatchingText(char.name)} (Born:
                      ${char.birth_year})
                    </li>
                  `
                )}
          </ul>
          ${this.state.selectedCharacter
            ? html`
                <div class="character-profile">
                  <h2>Selected Profile:</h2>
                  <div class="profile-icon">
                    🧑‍🚀 <span>Name:</span> ${this.state.selectedCharacter.name}
                  </div>
                  <div class="profile-icon">
                    📅 <span>Birth Year:</span> ${this.state.selectedCharacter
                      .birth_year}
                  </div>
                  <div class="profile-icon">
                    ⚧️ <span>Gender:</span> ${this.state.selectedCharacter
                      .gender}
                  </div>
                  <div class="footer">
                    <button
                      class="clear-btn"
                      @click=${() => this.handleClear()}
                    >
                      clear
                    </button>
                    <div></div>
                  </div>
                </div>
              `
            : nothing}
        </div>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "star-wars-autocomplete": StarWarsAutocomplete;
  }
}
