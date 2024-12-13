<?php
/**
 * Class Schema
 * 
 * @package NextPress
 * @since 0.0.1
 */

namespace NextPress;

class Schema {
    /**
     * Schema constructor
     */
    public function __construct() {
        $this->init();
    }

    /**
     * Initializes the class.
     * 
     * @return void
     */
    private function init() {
        add_action( 'graphql_register_types', [ $this, 'register_schema' ] );
    }

    /**
     * Register the schema
     * 
     * @return void
     */
    public function register_schema() {
        register_graphql_object_type(
            'UriAssets',
            [
                'interfaces' => [ 'Node' ],
                'fields' => [
                    'id' => [
                        'type' => 'ID',
                        'description' => __( 'The global ID of the URI Assets object.', 'nextpress' ),
                    ],
                    'uri' => [
                        'type' => 'String',
                        'description' => __( 'The URI of the assets.', 'nextpress' ),
                    ],
                ],
                'connections' => [
                    'enqueuedScripts' => [
                        'toType' => 'EnqueuedScript',
                        'description' => __( 'The scripts enqueued on the uri/path/route.', 'nextpress' ),
                    ],
                    'enqueuedStyles' => [
                        'toType' => 'EnqueuedStylesheets',
                        'description' => __( 'The scripts enqueued on the uri/path/route.', 'nextpress' ),
                    ],
                ],
            ]
        );
    
        register_graphql_field(
            'RootQuery',
            'assetsByUri',
            [
                'type' => 'UriAssets',
                'args' => [
                    'uri' => [
                        'type' => 'String',
                        'description' => __( 'The URI of the asset to query.', 'nextpress' ),
                    ],
                ],
                'resolve' => function ( $root, $args, $context, $info ) {
                    
                },
            ]
        );
    }
}