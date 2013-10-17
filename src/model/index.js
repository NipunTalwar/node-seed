module.exports = function( sequelize, mongoose, config ) {
    var exports = {}
      , m = {}
      , fs = require( 'fs' );

    config.models.forEach( function(model, i) {

        //load SQL models
        if ( fs.existsSync( __dirname + '/' + 'orm' + '/' + model + '.js' ) ) {
            //console.log("Importing "+model);
            m[model] = sequelize.import( __dirname + '/' + 'orm' + '/' + model );
            m[model].SQL = true;

            // Define relationships
            if ( typeof config.modelAssociations[model] !== 'undefined' ) {
                Object.keys( config.modelAssociations[model] ).forEach( function( assocType ) {
                    var associatedWith = config.modelAssociations[model][assocType];
                    if ( ! associatedWith instanceof Array ) {
                        associatedWith = [ associatedWith ];
                    }

                    associatedWith.forEach( function(assocTo) {
                        //console.log(modelName+" "+assocType+" of "+assocTo);
                        // Support second argument
                        if ( assocTo instanceof Array ) {
                            //console.log([modelName, assocType, assocTo[0]].join(' '), assocTo[1]);
                            m[ model ][ assocType ]( m[ assocTo[0] ], assocTo[1] );
                        } else {
                            //console.log([modelName, assocType, assocTo].join(' '));
                            m[ model ][ assocType ]( m[ assocTo ] );
                        }
                    });
                });
            } else {
                throw model + ' cannot be found in modelAssocations scope';
            }
        }

        // load NoSQL models
        if ( fs.existsSync( __dirname + '/' + 'odm' + '/' + model + '.js' ) ) {
            //console.log("Importing "+model);
            m[model] = require(__dirname + '/' + 'odm' + '/' + model)(mongoose);
            m[model].NoSQL = true;
        }
    });

    return m;
};
