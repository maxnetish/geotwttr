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
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['clean', 'browserify', 'uglify', 'less', 'copy']);
    grunt.registerTask('test', ['jest']);
    grunt.registerTask('testAndBuild', ['jest', 'clean', 'browserify', 'uglify', 'less', 'copy']);
};
