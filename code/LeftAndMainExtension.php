<?php

namespace ContentGrid;

use SilverStripe\Core\Extension;
use SilverStripe\Core\Convert;
use SilverStripe\View\Requirements;
use SilverStripe\Forms\HTMLEditor\TinyMCEConfig;


/**
 * This adds the TinyMCE config to LeftAndMain
 */
class LeftAndMainExtension extends Extension
{

    public function init()
    {
        $config = ContentGrid::config();
        $rowTypes =$config->row_types;

        TinyMCEConfig::get('cms')->enablePlugins(array('contentgrid' => '../../../contentgrid/javascript/plugin.js'));

        $jsRows = [];

        $buttons = array();
        foreach ($rowTypes as $class => $properties) {
            $buttonName = 'insert-'.$class;
            //$buttons[] = $buttonName;

            $js = '"'.$buttonName.'": {';
            $js .= '"text": "'.$properties['text'].'",';

            $buttonClass = 'mce_insertcontentgrid';
            if (isset($properties['class'])) {
                $buttonClass .= ' ' .$properties['class'];
            }
            $js .= '"class": "'.$buttonClass.'",';

            if (isset($properties['image'])) {
                $js .= '"image": "'.$properties['image'].'",';
            }

            if (isset($properties['icon'])) {
                $js .= '"icon": "'.$properties['icon'].'",';
            }

            $cellClasses = '';
            if (isset($properties['cell_classes'])) {
                $cellClasses = implode(';', $properties['cell_classes']);
            }


            $cells = $properties['cells'];

            $js .= <<<JS
"onclick": function() {
    tinymce.activeEditor.execCommand('contentGridInsertRow', { cells: {$cells}, class: '{$class}', cell_classes: '{$cellClasses}' });
}
}
JS;
            $jsRows[] = $js;
        }

        $buttons[] = 'contentgrid-insertrow';
        $buttons[] = 'contentgrid-moveup';
        $buttons[] = 'contentgrid-movedown';
        $buttons[] = 'contentgrid-deleterow';

        TinyMCEConfig::get('cms')->insertButtonsAfter('contentgrid', $buttons);
        TinyMCEConfig::get('cms')->removeButtons('contentgrid');

        $javascript = 'var contentGridInsertButtons = {';
        
        if ($config->first_class) {
            $javascript .= 'first_class: "' . $config->first_class . '",';
        }
        if ($config->last_class) {
            $javascript .= 'last_class: "' . $config->last_class . '",';
        }

        $javascript .= 'row_types: {';
        $javascript .= implode($jsRows, ',');
        $javascript .= '}};';

        Requirements::customScript($javascript, 'contentgridclasses');
    }
}
