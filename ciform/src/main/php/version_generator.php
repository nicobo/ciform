<?php

$previous_release = false;
// 'dev', 'alpha', 'beta', 'RC', 'stable'
$state = 'dev';
// 'initial', 'bugfix', 'additions', 'break', 'none'
$changes = 'bugfix';

$releases = array(
    array(
        'previous_release' => false,
        'state' => 'dev',
        'changes' => 'initial'
    ),
    array(
        'previous_release' => false,
        'state' => 'alpha',
        'changes' => 'bugfix'
    ),
    array(
        'previous_release' => false,
        'state' => 'alpha',
        'changes' => 'bugfix'
    ),
    array(
        'previous_release' => false,
        'state' => 'beta',
        'changes' => 'additions'
    ),
    array(
        'previous_release' => false,
        'state' => 'RC',
        'changes' => 'bugfix'
    ),
    array(
        'previous_release' => false,
        'state' => 'RC',
        'changes' => 'bugfix'
    ),
    array(
        'previous_release' => false,
        'state' => 'RC',
        'changes' => 'additions'
    ),
    array(
        'previous_release' => false,
        'state' => 'stable',
        'changes' => 'none',
    ),
    array(
        'previous_release' => false,
        'state' => 'stable',
        'changes' => 'bugfix'
    ),
    array(
        'previous_release' => false,
        'state' => 'stable',
        'changes' => 'additions'
    ),
    array(
        'previous_release' => false,
        'state' => 'RC',
        'changes' => 'break'
    ),
    array(
        'previous_release' => false,
        'state' => 'RC',
        'changes' => 'break'
    ),
    array(
        'previous_release' => false,
        'state' => 'stable',
        'changes' => 'bugfix'
    ),
);
echo '<pre>';
for($i=0, $j=count($releases); $i<$j;++$i) {
    $release = $releases[$i];
    print_r($release);
    echo '<br>';
    $version_name = generate_version($release['previous_release'], $release['state'], $release['changes']);
    if (isset($releases[$i+1])) {
        $releases[$i+1]['previous_release'] = $version_name;
    }
    echo $version_name.'<br>';
}
echo '</pre>';
function state_increased($state, $previous_state) {
    $state = ($state == 'stable') ? '' : $state;
    $previous_state = ($previous_state == 'stable') ? '' : $previous_state;
    $state = '0.1'.$state;
    $previous_state = '0.1'.$previous_state;
    return version_compare($state, $previous_state, '>');
}

function generate_version($previous_release, $state, $changes)
{
    $release = build_version($previous_release, $state, $changes);
    if (version_compare($release, $previous_release, '>')) {
        return $release;
    }
    echo 'error in the version builder detected';
    return false;
}

function build_version($previous_release, $state, $changes)
{
    // no previous release yet
    if(!$previous_release) {
        switch ($state) {
            case 'dev':
            case 'alpha':
            case 'beta':
                return '0.1'.$state.'1';
            case 'RC':
                return '1.0RC1';
            case 'stable':
                echo 'first release may not be stable';
                return false;
            default:
                echo 'unknown state';
                return false;
        }
    // there has been a previous release
    } else {
        if (preg_match("/([\d.]+)([a-z]*)(\d*)/i", $previous_release, $previous_release)) {
            $previous_version_number = $previous_release[1];
            $previous_state = $previous_release[2];
            $previous_state_number = $previous_release[3];
            $previous_sub_version_numbers = preg_split("/\./", $previous_version_number);
            $count_previous_sub_version_numbers = count($previous_sub_version_numbers);
            if ($count_previous_sub_version_numbers < 2) {
                echo 'previous version name does not include a major and minor version number';
                return false;
            } elseif($count_previous_sub_version_numbers > 2) {
                $previous_patchlevel = $previous_sub_version_numbers[2];
            } else {
                $previous_patchlevel = 0;
            }
            $previous_minor = $previous_sub_version_numbers[1];
            $previous_major = $previous_sub_version_numbers[0];
            // are we still under 1.0?
            if($previous_major < 1) {
                switch ($state) {
                    case 'dev':
                    case 'alpha':
                    case 'beta':
                        switch ($changes) {
                            case 'bugfix':
                                if ($state == $previous_state) {
                                    return $previous_version_number.$state.($previous_state_number+1);
                                } elseif (state_increased($state, $previous_state)) {
                                    return $previous_version_number.$state.'1';
                                } else {
                                    return '0.'.$previous_minor.'.'.($previous_patchlevel+1).$state.($previous_state_number+1);
                                }
                            case 'additions':
                            case 'break':
                                if (state_increased($state, $previous_state)) {
                                    return '0.'.($previous_minor+1).$state.'1';
                                } else {
                                    return '0.'.$previous_minor.$state.($previous_state_number+1);
                                }
                            default:
                                echo 'incorrect changes passed';
                                return false;
                        }
                    case 'RC':
                        return '1.0RC1';
                    case 'stable':
                        echo 'first release in a major version may not be stable';
                        return false;
                    default:
                        echo 'unknown state';
                        return false;
                }
            // there has been a release with a version number greater than 1.0
            } else {
                switch ($state) {
                    case 'dev':
                    case 'alpha':
                    case 'beta':
                    case 'RC':
                        // are we in the preparation phase for a new major release?
                        if ($previous_minor == 0) {
                            if ($previous_patchlevel == 0
                                && !state_increased($state, $previous_state)
                                && $state != $previous_state
                            ) {
                                echo 'state may not decrease in preparation of a new major release';
                                return false;
                            }
                            if (state_increased($state, $previous_state)) {
                                return $previous_major.'.'.$previous_minor.$state.'1';
                            } else {
                                return $previous_major.'.'.$previous_minor.$state.($previous_state_number+1);
                            }
                        // we already have a stable release in this major version number
                        } else {
                            switch ($changes) {
                                case 'bugfix':
                                    if (state_increased($state, $previous_state)) {
                                        return $previous_version_number.$state.'1';
                                    } else {
                                        return $previous_major.'.'.$previous_minor.'.'.($previous_patchlevel+1).$state.($previous_state_number+1);
                                    }
                                case 'additions':
                                    if (state_increased($state, $previous_state)) {
                                        return $previous_major.'.'.($previous_minor+1).$state.'1';
                                    } else {
                                        return $previous_major.'.'.$previous_minor.$state.($previous_state_number+1);
                                    }
                                case 'break':
                                    return ($previous_major+1).'.0'.$state.'1';
                                default:
                                    echo 'unknown change';
                                    return false;
                            }
                        }
                    case 'stable':
                        // state has increased to stable
                        if (state_increased($state, $previous_state)) {
                            return $previous_major.'.'.$previous_minor;
                        // we are moving from one stable release to another
                        } else {
                            switch ($changes) {
                                case 'none':
                                    return $previous_version_number;
                                case 'bugfix':
                                    if (state_increased($state, $previous_state)) {
                                        return $previous_version_number;
                                    } else {
                                        return $previous_major.'.'.$previous_minor.'.'.($previous_patchlevel+1);
                                    }
                                case 'additions':
                                    return $previous_major.'.'.($previous_minor+1);
                                case 'break':
                                    echo 'BC may only be broken in stable releases if a release with a lower state has been made with the same major version number';
                                    return false;
                                default:
                                    echo 'unknown change';
                                    return false;
                            }
                        }
                    default:
                        echo 'unknown state';
                        return false;
                }
            }
        } else {
            echo 'previous release has incorrect format';
            return false;
        }
    }
}

?>