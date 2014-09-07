module.exports = function (grunt) {

    var publicJs = 'public/js';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [
            publicJs
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
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['clean', 'browserify', 'uglify']);

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
