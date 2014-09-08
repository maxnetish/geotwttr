module.exports = function (grunt) {

    var publicJs = 'public/js';
    var publicCss = 'public/css';
    var publicFonts = 'public/fonts';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [
            publicJs,
            publicCss,
            publicFonts
        ],
        browserify: {
            options: {
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
                //sourceMap: true,
                //sourceMapIn: targetJsConcatAdmin + '.map',
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
                // cleancss: true
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
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['clean', 'browserify', 'uglify', 'less', 'copy']);

    // Load tasks from the tasks folder
    //grunt.loadTasks('tasks');

    // Load all the tasks options in tasks/options base on the name:
    // watch.js => watch{}
    //grunt.util._.extend(config, loadConfig('./tasks/options/'));

    //grunt.initConfig(config);

    // Default Task is basically a rebuild
    //grunt.registerTask('default', ['concat', 'uglify', 'sass', 'imagemin', 'autoprefixer', 'cssmin']);

    // Moved to the tasks folder:
    // grunt.registerTask('dev', ['connect', 'watch']);

};
