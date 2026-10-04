<a id="top"></a>

<p align="center">
  <img src="public/favicon.svg" width="80" alt="ViewFlow">
</p>

<h1 align="center">ViewFlow</h1>

<p align="center">
  A visual editor for flowcharts, concept maps, mind maps, and node-based diagrams.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-A855F7?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/AntV_X6-FF8067?style=for-the-badge" alt="AntV X6">
</p>

<p align="center">
  <a href="#description">Description</a> ·
  <a href="#features">Features</a> ·
  <a href="#local-installation-and-setup">Installation</a>
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a> ·
  <a href="README.es.md">🇪🇸 Español</a>
</p>

---

## Description

**ViewFlow** is a node-based visual diagram editor designed to create and organize information quickly and intuitively.

It can be used to create:

- Flowcharts.
- Concept maps.
- Mind maps.
- Node-based diagrams.
- Visual schemas and other information representations.

The application is designed to provide a simple and flexible experience, allowing elements to be freely arranged on an infinite canvas without the complexity of a general-purpose professional diagramming tool.

ViewFlow supports both light and dark modes and allows users to edit both the content and appearance of diagram elements.

<p align="center">
  <img src="public/ScreenShot ViewFlow.png" alt="ViewFlow screenshot">
</p>

---

## Features

### Element creation and manipulation

- Add nodes to the canvas.
- Create connections between nodes.
- Freely move nodes and connections.
- Resize nodes.
- Rotate nodes.
- Select one or multiple elements.

### Node types

- Rectangles.
- Diamonds.
- Circles.

### Selection and navigation

- Individual node and connection selection.
- Multiple selection with `Ctrl/Cmd + click`.
- Multiple selection by dragging over the canvas.
- Panning with `Space + click`.
- Zoom in / Zoom out.
- Infinite canvas.

---

## Node Editing

When a node is selected, a side panel displays its properties.

### Editable properties

- Internal text.
- Text size.
- Text color.
- Border color.
- Fill color.
- Fill opacity.
- Border radius for rectangles.

### Transformations

- Position.
- Size.
- Rotation.

### Actions

- Delete nodes from the properties panel.

---

## Connection Editing

Connections between nodes provide advanced editing controls for their appearance and routing.

### Available features

- Move connections.
- Connect endpoints to node ports.
- Use segments to create curves and intermediate vertices.
- Modify arrowhead shapes.
- Change connection color.
- Edit connection labels.
- Freely move labels across the canvas.
- Control vertex corner radius.
- Delete connections from the properties panel.

### Editable properties

- Color.
- Arrow type at the target end.
- Arrow type at the source end.
- Label text.
- Label size.
- Label color.
- Label position.
- Segment and vertex radius.

### Arrow types

- `— none`
- `▸ block`
- `∨ classic`
- `× cross`
- `○ circle`
- `⊕ circle plus`
- `◇ diamond`

### Ports

- Rectangular nodes: 16 ports.
- Other shapes: 8 ports.

---

## Canvas and History

The canvas provides tools to facilitate navigation and editing of large diagrams.

### Canvas management

- Show / hide grid.
- Zoom.
- Panning.
- Clear canvas.
- Reset view.
- Return to 100% zoom.

### History

- Undo actions.
- Redo actions.
- Up to **100 snapshots** stored in the history.

### Import and export

- Import diagrams as JSON.
- Export diagrams as JSON.
- Export diagrams as images.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + C` | Copy selected elements |
| `Ctrl/Cmd + V` | Paste copied elements |
| `Ctrl/Cmd + Z` | Undo |
| `Delete / Backspace` | Delete selected elements |
| `Space + Click` | Pan across the canvas |

---

## Protection Against Data Loss

ViewFlow displays a warning when the user attempts to leave the application while there are changes that may not have been saved.

This includes actions such as:

- Closing the tab.
- Reloading the page.
- Leaving the application.

To keep a backup of a diagram, exporting it as a JSON file is recommended.

---

## Local Installation and Setup

### Prerequisites

- Node.js.
- npm.
- Angular CLI.

### Installation

Clone the repository:

```bash
git clone https://github.com/fog-3/viewflow-editor.git
````

Navigate to the project directory:

```bash
cd viewflow-editor
```

Install the dependencies:

```bash
npm install
```

Start the application:

```bash
ng serve
```

Open your browser at:

```text
http://localhost:4200
```

---

## Technologies

* Angular 21
* TypeScript
* AntV X6
* HTML5
* CSS
* Tailwind CSS
