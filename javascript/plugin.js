(function($) {
var rowClass = 'content-row'
var cellClass = 'content-cell'

tinymce.create('tinymce.plugins.contentgrid', {
    init: function(editor, url) {
        this.editor = editor

        // If contentgrid isn't enabled for this editor, skip the rest
        var attribute = $(editor.targetElm).attr('data-content-grid')
        if (typeof attribute == 'undefined') {
            attribute = window.contentGridInsertButtons.enabled
        }
        if (attribute == false || attribute == 'false') {
            // This is an ugly hack to hide the empty toolbar where the grid
            //  controls are meant to be
            editor.onPreInit.add(function() {
                $(editor.container).find('.mce-toolbar').each(function() {
                    if ($(this).find('.mce-btn').length == 0) {
                        $(this).hide()
                    }
                })
            })
            return
        }

        editor.onPreInit.add(function() {
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
        editor.onPostProcess.add(function (e) {
            $(editor.getBody()).children(':not(.' + rowClass + ')').remove()
        })

        editor.addButton('contentgrid-moveup', {
            'title': 'Move row up',
            'cmd': 'contentGridMoveUp',
            'image': 'contentgrid/images/moveup.png',
            onpostrender: function() {
                var button = this
                editor.on('NodeChange', function(e) {
                    var container = this.plugins.contentgrid.getCurrentContainer()
                    button.disabled($(container).prev().length == 0)
                })
            }
        })

        editor.addButton('contentgrid-movedown', {
            'title': 'Move row down',
            'cmd': 'contentGridMoveDown',
            'image': 'contentgrid/images/movedown.png',
            onpostrender: function() {
                var button = this
                editor.on('NodeChange', function(e) {
                    var container = this.plugins.contentgrid.getCurrentContainer()
                    button.disabled($(container).next().length == 0)
                })
            }
        })

        editor.addButton('contentgrid-deleterow', {
            'title': 'Delete current row',
            'cmd': 'contentGridDelete',
            'image': 'contentgrid/images/delete.png',
            onpostrender: function() {
                var button = this
                editor.on('NodeChange', function(e) {
                    var container = this.plugins.contentgrid.getCurrentContainer()
                    button.disabled(typeof container == 'undefined')
                });
            }
        })

        editor.addCommand('contentGridInsertRow', this.insertRow)
        editor.addCommand('contentGridMoveUp', this.moveUp)
        editor.addCommand('contentGridMoveDown', this.moveDown)
        editor.addCommand('contentGridDelete', this.deleteRow)
    },

    createControl: function(name, cm) {
        var rowButtons = []
        for (var id in window.contentGridInsertButtons.row_types) {
            var data = window.contentGridInsertButtons.row_types[id]
            if (data['cell_classes']) {
               data['cell_classes'] = data['cell_classes'].split(';')
            }

            rowButtons.push(data)
        }

        switch (name) {
            case 'contentgrid-insertrow':
                var insertField = cm.createListBox('mylistbox', {
                    title : 'Insert a row',
                    onselect : function(v) {

                        console.log('Value selected:' + v)
                        rowButtons[v].onclick()
                    }
                });

                for (var i = 0; i < rowButtons.length; i++) {
                    var row = rowButtons[i]
                    insertField.add(row['text'], i)
                }

                return insertField;

            break;
        }
        return null;
    },

    enableButtonWhenRowSelected: function() {
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
    },

    getCurrentContainer: function() {
        var containerEl = false
        var target = this.editor.selection.getNode()
        while(target && target.nodeName.toLowerCase() != 'body' && containerEl === false) {
            if (target.classList && target.classList.contains(rowClass)) {
                return target
            }
            target = target.parentNode
        }
    },

    moveUp: function() {
        var currentContainer = this.plugins.contentgrid.getCurrentContainer()
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
    },

    moveDown: function() {
        var currentContainer = this.plugins.contentgrid.getCurrentContainer()
        var next = currentContainer.nextSibling

        if (next === null) {
            return false
        }

        var parentNode = currentContainer.parentNode
        var oldNext = parentNode.removeChild(next)
        parentNode.insertBefore(oldNext, currentContainer)
    },

    deleteRow: function() {
        var currentContainer = this.plugins.contentgrid.getCurrentContainer()
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

        this.windowManager.confirm('Are you sure you want to delete this row?', function(state) {
            if (state) {
                tinyMCE.activeEditor.dom.remove(currentContainer)
                // @TODO: make it register this content change
                tinyMCE.activeEditor.focus()
                tinyMCE.activeEditor.nodeChanged()
                if (next) {
                    tinyMCE.activeEditor.selection.setCursorLocation(next.firstChild)
                }
            }
        });
        return true
    },

    insertRow: function (settings) {
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

        var current = this.plugins.contentgrid.getCurrentContainer()
        if (current && (window.contentGridInsertButtons.insert_at_end === false || window.contentGridInsertButtons.insert_at_end === 'false')) {
            tinyMCE.activeEditor.dom.insertAfter(row, this.plugins.contentgrid.getCurrentContainer())
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
            }
            if (i == (settings.cells-1) && window.contentGridInsertButtons.last_class) {
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

    // Adds the plugin class to the list of available TinyMCE plugins
    tinymce.PluginManager.add("contentgrid", tinymce.plugins.contentgrid);
})(jQuery);






