

tinymce.PluginManager.add('contentgrid', function(editor, url) {
    var rowClass = 'content-row'
    var cellClass = 'content-cell'
    var $ = tinymce.dom.DomQuery

    // If contentgrid isn't enabled for this editor, skip the rest
    var attribute = $(editor.targetElm).attr('data-content-grid')
    if (typeof attribute == 'undefined') {
        attribute = window.contentGridInsertButtons.enabled
    }
    if (attribute == false || attribute == 'false') {  
        // This is an ugly hack to hide the empty toolbar where the grid
        //  controls are meant to be     
        editor.on('PreInit', function() {
            $(editor.container).find('.mce-toolbar').each(function() {
                if ($(this).find('.mce-btn').length == 0) {
                    $(this).hide()
                }
            })
        })
        return
    }


    editor.on('PreInit', function() {
        editor.dom.loadCSS('contentgrid/css/tinymce_contentgrid.css')

        // turn body contenteditable off
        editor.getBody().setAttribute('contenteditable', false)

        editor.parser.addAttributeFilter('class', function(nodes) {
            var i = nodes.length, className, node

            while (i--) {
                node = nodes[i]
                className = " " + node.attr("class") + " "

                if (className.indexOf(cellClass) !== -1) {
                    // turn region contenteditable on
                    node.attr('contenteditable', "true")
                }
            }
        })

        editor.serializer.addAttributeFilter('contenteditable', function(nodes) {
            var i = nodes.length, node;
            while (i--) {
                node = nodes[i];
                node.attr('contenteditable', null);
            }
        });
    })

    /**
     * This deletes any root elements that aren't content rows.
     * To get rid of TinyMCE's default "empty content" paragraph mostly.
     */
    editor.on('PostProcess', function (e) {
        $(editor.getBody()).children(':not(.' + rowClass + ')').remove()
    })

/*
    editor.on('change', function(e) {
        console.log('change event', e)
    })
*/

    var rowButtons = []
    for (var id in window.contentGridInsertButtons.row_types) {
        var data = window.contentGridInsertButtons.row_types[id]
        if (data['cell_classes']) {
           data['cell_classes'] = data['cell_classes'].split(';') 
        }
        
        rowButtons.push(data)
    }

    editor.addButton('contentgrid-insertrow', {
        'type': 'menubutton',
        'text': 'Insert a row',
        menu: rowButtons
    })

    editor.addButton('contentgrid-moveup', {
        'text': 'Move up',
        'tooltip': 'Move row up',
        'cmd': 'contentGridMoveUp',
        'icon': 'arrowup',
        onpostrender: function() {
            var button = this
            editor.on('NodeChange', function(e) {
                var container = getCurrentContainer()
                button.disabled($(container).prev().length == 0)
            })
        }
    })

    editor.addButton('contentgrid-movedown', {
        'text': 'Move down',
        'tooltip': 'Move row down',
        'cmd': 'contentGridMoveDown',
        'icon': 'arrowdown',
        onpostrender: function() {
            var button = this
            editor.on('NodeChange', function(e) {
                var container = getCurrentContainer()
                button.disabled($(container).next().length == 0)
            })
        }
    })

    editor.addButton('contentgrid-deleterow', {
        'text': 'Delete',
        'tooltip': 'Delete current row',
        'cmd': 'contentGridDelete',
        'icon': 'remove2',
        onpostrender: function() {
            var button = this
            editor.on('NodeChange', function(e) {
                var container = getCurrentContainer()
                button.disabled(typeof container == 'undefined')
            });
        }
    })

    editor.addCommand("contentGridInsertRow", insertRow)
    editor.addCommand("contentGridMoveUp", moveUp)
    editor.addCommand("contentGridMoveDown", moveDown)
    editor.addCommand("contentGridDelete", deleteRow)

    /**
     * This adds the table plugin-style popup buttons when a cell is focused but they don't work well in SS4
     *
    editor.addContextToolbar(
        isCell,
        contextButtons
    );
    */

/*
    function isCell(cell) {
        var selectorMatched = editor.dom.is(cell, '.'+cellClass) && editor.getBody().contains(cell);
        return selectorMatched;
    }
*/

    function enableButtonWhenRowSelected() {
        var button = this
        editor.on('NodeChange', function(e) {
            var containerEl = false
            var target = e.element
            while(target.nodeName.toLowerCase() != 'body' && containerEl === false) {
                if (target.classList.contains(rowClass)) {
                    containerEl = target
                    continue;
                }
                target = target.parentNode
            }

            button.disabled(e.element.nodeName.toLowerCase() != 'time')
        });
    }

    function getCurrentContainer() {
        var containerEl = false
        var target = editor.selection.getNode()
        while(target && target.nodeName.toLowerCase() != 'body' && containerEl === false) {
            if (target.classList && target.classList.contains(rowClass)) {
                return target
            }
            target = target.parentNode
        }
    }

    function moveUp() {
        var currentContainer = getCurrentContainer()
        var previous = currentContainer.previousSibling

        if (previous === null) {
            return false
        }

        var parentNode = currentContainer.parentNode

        // my kingdom for insertAfter()
        var oldPrevious = parentNode.removeChild(previous)
        var next = currentContainer.nextSibling
        if (next) {
            parentNode.insertBefore(oldPrevious, next)
        } else {
            parentNode.append(oldPrevious)
        }
    }

    function moveDown() {
        var currentContainer = getCurrentContainer()
        var next = currentContainer.nextSibling

        if (next === null) {
            return false
        }

        var parentNode = currentContainer.parentNode
        var oldNext = parentNode.removeChild(next)
        parentNode.insertBefore(oldNext, currentContainer)
    }

    function deleteRow() {
        var currentContainer = getCurrentContainer()
        if (!currentContainer) {
            return false
        }
        var next = currentContainer.nextSibling
        var previous = currentContainer.previousSibling

        // this just stops you deleting it if there are no siblings
        // @TODO: find a better way, including things like http://archive.tinymce.com/wiki.php/api4:method.tinymce.dom.DOMUtils.getNext
        if (!next && !previous) {
            return false;
        }

        editor.windowManager.confirm('Are you sure you want to delete this row?', function(state) {
            if (state) {
                editor.dom.remove(currentContainer)
                // @TODO: make it register this content change
                editor.focus()
                editor.nodeChanged()
                if (next) {
                    editor.selection.setCursorLocation(next.firstChild)
                }
                //editor.dom.remove(deletedummy);
            }
        });
        return true;
    }

    function insertRow(settings) {
        if (!settings) {
            var settings = {}
        }
        if (!settings.cells) {
            settings.cells = 1
        }
        if (!settings.class) {
            settings.class = ''
        }

        if (settings.cell_classes) {
            settings.cell_classes = settings.cell_classes.split(';')
        } else {
            settings.cell_classes = []
        }

        var body = tinyMCE.activeEditor.getBody()

        // adds the new row after the currently selected one
        var row = tinyMCE.activeEditor.dom.create('div', {
            'class' : rowClass+' '+settings.class
        })

        var current = getCurrentContainer()
        if (current && (window.contentGridInsertButtons.insert_at_end === false || window.contentGridInsertButtons.insert_at_end === 'false')) {
            tinyMCE.activeEditor.dom.insertAfter(row, getCurrentContainer())
        } else {
            tinyMCE.activeEditor.dom.add(body, row)
        }
        
        
        var i = 0
        var cells = []
        var firstCell = false;

        while (i < settings.cells) {
            var cellClasses = cellClass
            
            if (settings.cell_classes[i]) {
                cellClasses += ' ' + settings.cell_classes[i]
            }

            if (i == 0 && window.contentGridInsertButtons.first_class) {
                cellClasses += ' ' + window.contentGridInsertButtons.first_class
            } else if (i == (settings.cells-1) && window.contentGridInsertButtons.last_class) {
                cellClasses += ' ' + window.contentGridInsertButtons.last_class
            }

            var cell = tinyMCE.activeEditor.dom.create('div', {
                'class': cellClasses
                ,'contenteditable': true
            }, '<p><br /></p>')
            row.append(cell)
            if (!firstCell) {
                firstCell = cell
            }
            i++
        }

        tinyMCE.activeEditor.selection.setCursorLocation(firstCell)
    }

});







