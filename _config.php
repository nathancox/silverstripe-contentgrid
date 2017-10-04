<?php

//HtmlEditorConfig::get('cms')->addButtonsToLine(3, 'contentgrid');

// This stops TinyMCE from deleting empty cells
$validEls = HtmlEditorConfig::get('cms')->getOption('extended_valid_elements');
HtmlEditorConfig::get('cms')->setOption('extended_valid_elements', $validEls . ',div[*]');
