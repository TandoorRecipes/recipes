import {WidgetType} from "@codemirror/view";

class PlaceholderWidget extends WidgetType {
    constructor(readonly name: string) {
        super()
    }

    eq(other: PlaceholderWidget) {
        return this.name == other.name
    }

    toDOM() {
        const elt = document.createElement("span")
        elt.style.cssText = `
      border: 1px solid blue;
      border-radius: 4px;
      padding: 0 3px;
      background: lightblue;`
        console.log('reading name', this.name)
        elt.textContent = this.name
        return elt
    }

    ignoreEvent() {
        return false
    }
}