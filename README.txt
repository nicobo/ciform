This folder contains several projects and dependent resources :

ciform      -> Ciform project directory tree
codecs      -> Dependent Javascript libraries for Ciform
            Each subdirectory is a Maven-style project with a build script that generates Ivy artifacts for use with Ciform.
            Run "ant install" to generate and import artifacts into the local Ivy repository.
tools       -> Tools required to build the projects : extract required binaries before building the projects