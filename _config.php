<?php

use SilverStripe\Forms\HTMLEditor\TinyMCEConfig;

TinyMCEConfig::get('cms')->addButtonsToLine(3, 'contentgrid');


// This stops TinyMCE from deleting empty cells
$validEls = TinyMCEConfig::get('cms')->getOption('extended_valid_elements');
$validEls .= ',div[*]';
TinyMCEConfig::get('cms')->setOption('extended_valid_elements', $validEls);
