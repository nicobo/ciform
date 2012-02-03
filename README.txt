This folder contains several projects and dependent resources :

ciform/         -> Ciform project root
codecs/         -> Dependent Javascript libraries for Ciform
                Each subdirectory is a Maven-style project with a build script that generates Ivy artifacts for use with Ciform.
                Run "ant install" to generate and import artifacts into the local Ivy repository.
minilib/        -> minilib project root
tools/          -> Tools required to build the projects : extract required binaries before building the projects
tools/build/    Custom scripts and configuration files for this project

Each project may contain the following directories/files :
    - build.properties  Default properties for the build script
    - build.xml         Ant build script
    - build/            Temporary build files
    - ivy.xml           Ivy descriptor for the project (includes version and dependencies)
    - src/main/js       Main source files (Javascript)
    - src/main/php      Main source files (PHP)
    - src/pix           Pictures sources (logos, icons)
    - target/           Generated files for distribution
    - target/doc        Documents related to the project
    - target/doc/api    Developer docs for the project
    - target/doc/ivy    Dependency report for the project
    - target/lib            Library artifacts of this project
    - target/lib/*-min.js   Minified libraries
    - target/lib/lib*.js    Standalone libraries (contains the project and all its dependencies)
    - test/resources    Different kind of resources for the tests

The build scripts will generate files in a given <publications> directory :
    nicobo/ciform/<version>/README.txt             Main informations about the project
    /ciform/<version>/LICENSE.txt            Project's license
    /ciform/<version>/NOTICE.txt             Notices and attributions required by libraries that the project depends on
    /ciform/<version>/ivy.xml                Ivy project descriptor
    /ciform/<version>/pom.xml                Maven project descriptor
    /ciform/<version>/ciform.js              Source library
    /ciform/<version>/ciform-min.js          Minified source library
    /ciform/<version>/libciform.js           Standalone library
    /ciform/<version>/libciform-min.js       Minified standalone library
    /ciform/<version>/doc/api/js/*           API documentation
    (same for all projects...)

To build the projects, you should only need to :
    - extract the required binaries into the 'tools' directory
    - rename 'common-sample.properties' in 'tools/build' to 'common.properties' and edit it to reflect your local configuration
    - run ant on each project