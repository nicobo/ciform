This folder contains several projects and dependent resources :

ciform      -> Ciform project directory tree
codecs      -> Dependent Javascript libraries for Ciform
            Each subdirectory is a Maven-style project with a build script that generates Ivy artifacts for use with Ciform.
            Run "ant install" to generate and import artifacts into the local Ivy repository.
tools       -> Tools required to build the projects : extract required binaries before building the projects

To build the projects, you should only need to :
    - extract the required binaries into the 'tools' directory
    - rename 'common-sample.properties' in 'tools/build' to 'common.properties' and edit it to reflect your local configuration
    - run ant in each project