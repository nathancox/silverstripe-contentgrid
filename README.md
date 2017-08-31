# SilverStripe ContentGrid Module

Adds TinyMCE buttons for creating content structured in grids/columns.  You create your own grid markup and classes.  Grid rows aren't nestable (yet) and assume assume all the content in the field will be stored in grid rows (you can't have content that isn't in one) so make sure to provide a "100% width" option.

**This module is still work in progress**

[example of contentgrid in TinyMCE](./doc/content-grid-1.png)


## Maintainer Contact

* Nathan Cox <me@nathan.net.nz>

## Requirements

* silverstripe/cms >=4.0

## Installation

Composer coming some day.



You will have to make your own grid CSS in your site's theme, this module doesn't provide one. The module inserts the following markup:

```html
<div class="content-row your-row-class">
  <div class="content-cell first"></div>
  <div class="content-cell"></div>
  ...
  <div class="content-cell last"></div>
</div>
```
In future these class names will be configurable but for now it always uses `.content-row` and `.grid-row`.  Make sure your grid styles are accessible in editor.css so they work in TinyMCE.



```yml
NathanCox\ContentGrid\ContentGrid:
  row_types:
    twelve:
      cells: 1
      text: 1
    six-six:
      cells: 2
      text: 1-1
    four-four-four:
      cells: 3
      text: 1-1-1
      cell_classes:
        - a
        - 
        - c
    eight-four:
      cells: 2
      text: 2-1
      cell_classes:
        - content
        - sidebar
```

## Usage

* Only content inside grid cells is editable.  That means at least one grid row has to be inserted before any content can be put on the page.
* Insert a row by picking an option from the *Insert a row* dropdown.  The new row will either be added at the bottom of the content or immediately after the currently selected row, depending on configuration.
* Use the *Move up* and *Move down* buttons to move the currently selected row up or down the page.
* Use the *Delete* button to delete the current row and all it's content.
* Once you've inserted a row you can't change the number or layout of it's columns.  You'll have to insert a new row and copy the content in to that instead.


##Known Issues

[Issue Tracker](https://github.com/nathancox/silverstripe-contentgrid/issues)
