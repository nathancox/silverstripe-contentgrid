<?php

namespace NathanCox\ContentGrid;

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

            $js = '"'.$buttonName.'": {';
            if (isset($properties['text'])) {
                $js .= '"text": "'.$properties['text'].'",';
            } else {
                $js .= '"text": "'.$class.'",';
            }

            $buttonClass = 'mce_insertcontentgrid';
            if (isset($properties['button_class'])) {
                $buttonClass .= ' ' .$properties['button_class'];
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

            if (isset($properties['cells'])) {
                $cells = $properties['cells'];
            } else if (isset($properties['cell_classes'])) {
                $cells = count($properties['cell_classes']);
            }


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

        $javascript .= 'enabled: ' . ($config->enabled ? 'true' : 'false') . ',';
        $javascript .= 'insert_at_end: ' . ($config->insert_at_end ? 'true' : 'false') . ',';

        $javascript .= 'row_types: {';
        $javascript .= implode($jsRows, ',');
        $javascript .= '}};';

        Requirements::customScript($javascript, 'contentgridclasses');
    }
}
