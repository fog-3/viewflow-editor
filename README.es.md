<a id="top"></a>

<p align="center">
  <img src="public/favicon.svg" width="80" alt="ViewFlow">
</p>

<h1 align="center">ViewFlow</h1>

<p align="center">
  Editor visual para diagramas de flujo, mapas conceptuales, mapas mentales y diagramas basados en nodos.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-A855F7?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/AntV_X6-FF8067?style=for-the-badge" alt="AntV X6">
</p>

<p align="center">
  <a href="#descripcion">Descripción</a> ·
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#instalacion-y-ejecucion-en-local">Instalación</a>
</p>

<p align="center">
  <a href="https://viewflow-beta.vercel.app/">
    <strong>🔗 Live Demo</strong>
  </a>
</p>


---

## Descripción

**ViewFlow** es un editor visual de diagramas basado en nodos, diseñado para crear y organizar información de forma rápida e intuitiva.

Puede utilizarse para construir:

- Diagramas de flujo.
- Mapas conceptuales.
- Mapas mentales.
- Diagramas basados en nodos.
- Esquemas visuales y otras representaciones de información.

La aplicación está pensada para ofrecer una experiencia sencilla y flexible, permitiendo organizar elementos libremente sobre un lienzo infinito sin la complejidad de una herramienta de diagramación profesional de propósito general.

ViewFlow incluye modo claro y modo oscuro y permite editar tanto el contenido como la apariencia de los elementos del diagrama.

<p align="center">
  <img src="public/ScreenShot ViewFlow.png" alt="ViewFlow screenshot">
</p>

---

## Funcionalidades

### Creación y manipulación de elementos

- Añadir nodos al lienzo.
- Crear conexiones entre nodos.
- Mover nodos y conexiones libremente.
- Redimensionar nodos.
- Rotar nodos.
- Seleccionar uno o varios elementos.

### Tipos de nodos

- Rectángulos.
- Rombos.
- Círculos.

### Selección y navegación

- Selección individual de nodos y conexiones.
- Selección múltiple con `Ctrl/Cmd + click`.
- Selección múltiple mediante arrastre sobre el lienzo.
- Panning con `Space + click`.
- Zoom in / Zoom out.
- Lienzo infinito.

---

## Edición de nodos

Al seleccionar un nodo, aparece un panel lateral con sus propiedades.

### Propiedades editables

- Texto interno.
- Tamaño del texto.
- Color del texto.
- Color del borde.
- Color de relleno.
- Opacidad del relleno.
- Border radius en rectángulos.

### Transformaciones

- Posición.
- Tamaño.
- Rotación.

### Acciones

- Eliminar nodo desde el panel de propiedades.

---

## Edición de conexiones

Las conexiones entre nodos disponen de herramientas de edición para controlar su apariencia y recorrido.

### Funcionalidades disponibles

- Mover conexiones.
- Conectar extremos a puertos de los nodos.
- Utilizar segmentos para crear curvas y vértices intermedios.
- Modificar la forma de las puntas.
- Cambiar el color de la conexión.
- Editar el texto de la etiqueta.
- Mover etiquetas libremente por el lienzo.
- Controlar el radio de curvatura de los vértices.
- Eliminar conexiones desde el panel de propiedades.

### Propiedades editables

- Color.
- Tipo de flecha en el extremo source.
- Tipo de flecha en el extremo target.
- Texto de la etiqueta.
- Tamaño de la etiqueta.
- Color de la etiqueta.
- Posición de la etiqueta.
- Radio de segmentos y vértices.

### Tipos de flecha

- `— none`
- `▸ block`
- `∨ classic`
- `× cross`
- `○ circle`
- `⊕ circle plus`
- `◇ diamond`

### Puertos

- Nodos rectangulares: 16 puertos.
- Resto de figuras: 8 puertos.

---

## Lienzo e historial

El lienzo incorpora herramientas para facilitar la navegación y edición de diagramas grandes.

### Gestión del lienzo

- Mostrar / ocultar grid.
- Zoom.
- Panning.
- Limpiar lienzo.
- Reset de vista.
- Volver al 100% de zoom.

### Historial

- Deshacer acciones.
- Rehacer acciones.
- Hasta **100 snapshots** almacenados en el historial.

### Importación y exportación

- Importar diagramas mediante JSON.
- Exportar diagramas mediante JSON.
- Exportar el diagrama como imagen.

---

## Atajos de teclado

| Atajo | Acción |
|---|---|
| `Ctrl/Cmd + C` | Copiar elementos seleccionados |
| `Ctrl/Cmd + V` | Pegar elementos copiados |
| `Ctrl/Cmd + Z` | Deshacer |
| `Delete / Backspace` | Eliminar elementos seleccionados |
| `Space + Click` | Moverse por el lienzo |

---

## Protección frente a pérdida de cambios

ViewFlow muestra un aviso cuando el usuario intenta abandonar la aplicación mientras existen cambios que podrían no haberse guardado.

Esto incluye acciones como:

- Cerrar la pestaña.
- Recargar la página.
- Abandonar la aplicación.

Para disponer de una copia de seguridad del diagrama, se recomienda exportarlo en formato JSON.

---

## Instalación y ejecución en local

### Requisitos previos

- Node.js.
- npm.
- Angular CLI.

### Instalación

Clona el repositorio:

```bash
git clone https://github.com/fog-3/viewflow-editor.git
````

Entra en el directorio:

```bash
cd viewflow-editor
```

Instala las dependencias:

```bash
npm install
```

Ejecuta la aplicación:

```bash
ng serve
```

Abre el navegador en:

```text
http://localhost:4200
```

---

## Tecnologías

* Angular 21
* TypeScript
* AntV X6
* HTML5
* CSS
* Tailwind CSS