module.exports = function (grunt) {

    var publicJs = 'public/js';
    var publicCss = 'public/css';
    var publicFonts = 'public/fonts';
    var nodeModules = 'node_modules';
    var nodeModulesSelect2 = nodeModules + '/select2';

    //var gruntReact = require('grunt-react');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [
            publicJs,
            publicCss,
            publicFonts
        ],
        browserify: {
            options: {
                transform: ['reactify'],
                browserifyOptions: {
                    debug: true
                }
            },
            'public/js/app.js': ['webapps/public/app.js']
        },
        uglify: {
            buildAll: {
                files: {
                    'public/js/app.min.js': ['public/js/app.js']
                }
            },
            options: {
                compress: {
                    drop_console: true
                }
            }
        },
        less: {
            build: {
                files: [
                    {
                        src: 'webapps/less/style.less',
                        dest: publicCss + '/app.css'
                    }
                ]
            },
            options: {
                // sourceMap: true
                cleancss: true
            }
        },
        concat: {
            // не надо
            includeSelect2Css: {
                src: [
                    publicCss + '/app.css',
                    nodeModulesSelect2 + '/select2.css'
                ],
                dest: publicCss + '/app.css'
            }
        },
        copy: {
            buildAll: {
                files: [
                    {
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: 'webapps/fonts/*',
                        dest: publicFonts + '/'
                    }
                ]
            },
            includeSelect2Resources: {
                files: [
                    {
                        src: nodeModulesSelect2 + '/select2.png',
                        dest: publicCss + '/select2.png'
                    },
                    {
                        src: nodeModulesSelect2 + '/select2-spinner.gif',
                        dest: publicCss + '/select2-spinner.gif'
                    }
                ]
            }
        },
        jest: {
            options: {
                unmockedModulePathPatterns: [
                    "lodash"
                ]
            }
        },
        delta: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729, which your browser
             * plugin should auto-detect.
             */
            options: {
                livereload: true
            },

            /**
             * When our JavaScript source files change, we want to browserify
             * but uglifying really not needed
             */
            js: {
                files: ['webapps/public/**/*.js', '!webapps/public/**/__tests__/*.*'],
                tasks: ['browserify']
            },

            /**
             * When the LESS files change, we need to compile them.
             */
            less: {
                files: ['webapps/less/**/*.less'],
                tasks: ['less']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    /**
     * In order to make it safe to just compile or copy *only* what was changed,
     * we need to ensure we are starting from a clean, fresh build. So we rename
     * the `watch` task to `delta` (that's why the configuration var above is
     * `delta`) and then add a new task called `watch` that does a clean build
     * before watching for changes.
     */
    grunt.renameTask('watch', 'delta');

    grunt.registerTask('watch', [ 'clean', 'browserify', 'uglify', 'less', 'copy', 'delta' ]);

    grunt.registerTask('default', ['clean', 'browserify', 'uglify', 'less', 'copy']);
    grunt.registerTask('test', ['jest']);
    grunt.registerTask('testAndBuild', ['jest', 'clean', 'browserify', 'uglify', 'less', 'copy']);
};
