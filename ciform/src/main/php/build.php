<?php

    require_once('PEAR/PackageFileManager.php');

    $packagexml = new PEAR_PackageFileManager;

    $e = $packagexml->setOptions(
        array('baseinstalldir' => 'Ciform',
        'package' => "Ciform",
        'summary' => "TODO",
        'description' => "TODO",
        'version' => "0.0.0",
        'packagedirectory' => "src/main/php",
        'state' => "devel",
        'filelistgenerator' => "file",
        'notes' => "TODO",
        //'ignore' => array('TODO', 'tests/'),            // ignore TODO, all files in tests/
        'installexceptions' => array('phpdoc' => '/*'), // baseinstalldir ="/" for phpdoc
        'dir_roles' => array(
            'tutorials' => 'doc',
            'src/test/php' => "test")
        //'exceptions' => array(
        //    'README' => 'doc',                          // README would be data, now is doc
        //    'PHPLICENSE.txt' => 'doc')                 // same for the license
        )
    );
    if (PEAR::isError($e)) { echo $e->getMessage(); die(); }

//     $e = $test->addPlatformException('pear-phpdoc.bat', 'windows');
//     if (PEAR::isError($e)) { echo $e->getMessage(); exit; }

//     $packagexml->addRole('pkg', 'doc'); // add a new role mapping
//     if (PEAR::isError($e)) { echo $e->getMessage(); exit; }

//     // replace @PHP-BIN@ in this file with the path to php executable!  pretty neat
//     $e = $test->addReplacement('pear-phpdoc', 'pear-config', '@PHP-BIN@', 'php_bin');
//     if (PEAR::isError($e)) { echo $e->getMessage(); exit; }

//     $e = $test->addReplacement('pear-phpdoc.bat', 'pear-config', '@PHP-BIN@', 'php_bin');
//     if (PEAR::isError($e)) { echo $e->getMessage(); exit; }

    $e = $packagexml->addMaintainer("nicobo", "lead", "Nicolas BONARDELLE", "cbonar@users.sf.net");
    if (PEAR::isError($e)) { echo $e->getMessage(); exit; }

    // note use of debugPackageFile() - this is VERY important
    if (isset($_GET['make']) || $_SERVER['argv'][1] == 'make') {
        $e = $packagexml->writePackageFile();
    } else {
        $e = $packagexml->debugPackageFile();
    }
    if (PEAR::isError($e)) { echo $e->getMessage(); die(); }

?>