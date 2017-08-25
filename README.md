# silverstripe-contentgrid
Adds TinyMCE buttons to manage multi column layouts in SilverStripe CMS

This is still a work in progress, hopefully better instructions will come later


```yml
ContentGrid\ContentGrid:
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
