/*
 * evenZoom - jQuery Plugin
 * version: 1.0 (1 Mar 2015)
 * @requires jQuery v1.6.3 or later
 *
 * www.even.lv
 * info@even.lv
 *
 * http://www.even.lv/files/creative/evenZoom/demo/
 *
 * Copyright (c) 2015 Arthur Lutkevichus
 *
 */

(function( $ ) {
    /*
     * Plugin initialization
     * @param settings Plugin options object
     */
    $.fn.evenZoom = function( options ) {
        var evenZoom = new EvenZoom( $( this ), options );

        // Events
        $( this ).mouseenter(function() {
            evenZoom.checkImageChanged( $( this ) );
            evenZoom.showLens();
        } ).mousemove(function( e ) {
            evenZoom.moveLens( e.pageX, e.pageY );
        } ).mouseleave( function() {
            evenZoom.hideLens();
        } );
    };

    /*
     * evenZoom class
     */
    function EvenZoom( $container, options ) {
        /**
         * Initialization method
         *
         * @param settings Plugin options object
         * @private
         */
        this._init = function( settings ) {
            if (typeof settings != "object") {
                settings = {};
            }

            this.settings = {
                // Properties
                lensPinningDistance: 20
            };
            // Override default settings
            this.settings = $.extend( this.settings, settings );

            // evenZoom image container definition and calculations
            this.$container = $container;
            this.$container.addClass( "evenZoom" ).append( "<div class=\"evenZoomLens hidden\"></div>" );

            // Calculating image size
            this._calculateImagesSize();

            // Lens definition and calculations
            this.$lens = $( ".evenZoomLens", this.$container );
            this.$lens.css( "background-image", "url('" + this.zoomedImgSrc + "')" );
            this.lensWidth = this.$lens.width();
            this.lensHeight = this.$lens.height();
            this.lensWidthHalf = this.lensWidth / 2;
            this.lensHeightHalf = this.lensHeight / 2;
            this.currentLensPositionX = 0;
            this.currentLensPositionY = 0;
        };

        /**
         * Calculates original image and zoomed image sizes
         * @private
         */
        this._calculateImagesSize = function() {
            this.imgSrc = this._findOriginalImg( this.$container );
            this.zoomedImgSrc = this.$container.data( "zoomed" );
            if (this.zoomedImgSrc) {
                var that = this;
                $( "<img src='" + this.imgSrc + "'/>" ).load( function() {
                    var imgWidth = this.width;
                    var imgHeight = this.height;
                    // Calculate container width and height
                    that.containterWidth = that.$container.width();
                    that.containterHeight = that.$container.height();

                    $( "<img src='" + that.zoomedImgSrc + "'/>" ).load( function() {
                        if (this.width < imgWidth || this.height < imgHeight) {
                            that.zoomedImgSrc = that.imgSrc;
                            that.imgWidthRatio = 1;
                            that.imgHeightRatio = 1;
                        }
                        else {
                            that.imgWidthRatio = this.width / imgWidth;
                            that.imgHeightRatio = this.height / imgHeight;
                        }
                    } );
                } );
            }
            else {
                console.warn( "No zoomed img found, please set \"data-zoomed\" for evenZoom selector" );
            }
        };

        /**
         * Finds original image inside in container
         * @param $container
         * @returns {*}
         * @private
         */
        this._findOriginalImg = function( $container ) {
            if ($( "img", $container ).length) {
                return $( "img:first", $container ).attr( "src" );
            }
            console.warn( "No original img found, please set \"data-img\" for evenZoom selector" );
            return false;
        };

        /**
         * Calculates lens image position
         * @private
         */
        this.calculateBackgroundPosition = function() {
            var backgroundPosX = ((this.currentLensPositionX - this.$container.offset().left + this.lensWidthHalf) * this.imgWidthRatio) * (-1) + this.lensWidthHalf;
            var backgroundPosY = ((this.currentLensPositionY - this.$container.offset().top + this.lensHeightHalf) * this.imgHeightRatio) * (-1) + this.lensHeightHalf;

            this.$lens.css( "background-position", backgroundPosX + "px " + backgroundPosY + "px" );
        };


        // Initialize evenZoom
        this._init( options );
    }

    /**
     * Shows lens
     */
    EvenZoom.prototype.showLens = function() {
        this.$lens.removeClass( "hidden" );
    };

    /**
     * Hides lens
     */
    EvenZoom.prototype.hideLens = function() {
        this.$lens.addClass( "hidden" );
    };

    /**
     * Checks if original image changed
     * @param $container evenZoom container
     */
    EvenZoom.prototype.checkImageChanged = function( $container ) {
        var newImgSrc = this._findOriginalImg( $container );
        if (newImgSrc != this.imgSrc) {
            if (newImgSrc != false) {
                this.reinitialize( $container );
            }
            else {
                this.hideLens();
            }
        }
    };

    /**
     * Changes image in lens and recalculates sizes
     * @param $container
     */
    EvenZoom.prototype.reinitialize = function( $container ) {
        this.$container = $container;
        this.containterWidth = this.$container.width();
        this.containterHeight = this.$container.height();
        this._calculateImagesSize();
        this.$lens.css( "background-image", "url('" + this.zoomedImgSrc + "')" );
    };

    /**
     * Moves lens and calculates lens image position
     * @param newPosX Position on x axis
     * @param newPosY Position on y axis
     */
    EvenZoom.prototype.moveLens = function( newPosX, newPosY ) {
        var lensPosX = newPosX - this.lensWidthHalf;
        var lensPosY = newPosY - this.lensHeightHalf;

        // Calculating maximal and minimal lens positions
        var minLensPosX = this.$container.offset().left - this.lensWidthHalf;
        var minLensPosY = this.$container.offset().top - this.lensHeightHalf;
        var maxLensPosX = minLensPosX + this.containterWidth;
        var maxLensPosY = minLensPosY + this.containterHeight;

        // Check if lens is out of range on X axis
        var hideLens = false;
        if (lensPosX <= minLensPosX) {
            if (minLensPosX - lensPosX >= this.settings.lensPinningDistance) {
                hideLens = true;
            }
            lensPosX = minLensPosX;
        } else if (lensPosX >= maxLensPosX) {
            if (lensPosX - maxLensPosX >= this.settings.lensPinningDistance) {
                hideLens = true;
            }
            lensPosX = maxLensPosX;
        }

        // Check if lens is out of range on Y axis
        if (lensPosY <= minLensPosY) {
            if (minLensPosY - lensPosY >= this.settings.lensPinningDistance) {
                hideLens = true;
            }
            lensPosY = minLensPosY;
        } else if (lensPosY >= maxLensPosY) {
            if (lensPosY - maxLensPosY >= this.settings.lensPinningDistance) {
                hideLens = true;
            }
            lensPosY = maxLensPosY;
        }

        // Hide lens if out of range
        if (!hideLens) {
            this.showLens();
        }
        else {
            this.hideLens();
        }

        // Set new lens position
        this.$lens.offset( {
            left: lensPosX,
            top: lensPosY
        } );

        this.currentLensPositionX = lensPosX;
        this.currentLensPositionY = lensPosY;

        // Calculate lens image position
        this.calculateBackgroundPosition();
    };
}( jQuery ));
