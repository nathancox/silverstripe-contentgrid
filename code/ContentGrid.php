<?php

nameSpace ContentGrid;

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
}
