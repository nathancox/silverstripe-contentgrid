<?php

nameSpace NathanCox\ContentGrid;

use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Extension;
use SilverStripe\Core\Object;

class ContentGrid
{
	use Configurable;
    /**
     * @config
     */
    private static $row_types = array();

    /**
     * The class applied to the first element in each row.
     * @config
     */
    private static $first_class = 'first';

    /**
     * The class applied to the last element in each row.
     * @config
     */
    private static $last_class = 'last';


    /**
     * If set to true the grid controls will be applied to all HTMLEditorFields.
     * Fields can be excluded using $field->setAttribute('data-content-grid', 'false').
     * @config
     */
    private static $enabled = true;

    /**
     * By default new rows are inserted after the currently focused one.
     * Set this to true to always insert them at the bottom of the page.
     * @config
     */
    private static $insert_at_end = false;


}
