/**
 * @param {Object} $    - Global jQuery object
 * @param {Object} bolt - The Bolt module
 */
(function ($, bolt) {
    'use strict';

    /**
     * Textlist field widget.
     *
     * @license http://opensource.org/licenses/mit-license.php MIT License
     * @author rarila
     *
     * @class fieldTextlist
     * @memberOf jQuery.widget.bolt
     * @extends jQuery.widget.bolt.baseField
     */
    $.widget('bolt.fieldTextlist', $.bolt.baseField, /** @lends jQuery.widget.bolt.fieldTextlist.prototype */ {
        /**
         * The constructor of the filelist field widget.
         *
         * @private
         */
        _create: function () {
            var self = this,
                fieldset = this.element;

            /**
             * Refs to UI elements of this widget.
             *
             * @type {Object}
             * @name _ui
             * @memberOf jQuery.widget.bolt.fieldTextlist.prototype
             * @private
             *
             * @property {Object} data - List data holder
             * @property {Object} list - List container
             */
            this._ui = {
                data: fieldset.find('textarea.hide'),
                list: fieldset.find('.list')
            };

            /**
             * Index of the last clicked item.
             *
             * @type {number}
             * @name _lastClickIndex
             * @memberOf jQuery.widget.bolt.fieldTextlist.prototype
             * @private
             */
            this._lastClickIndex = 0;

            // Make the list sortable.
            self._ui.list.sortable({
                // Set a helper element to be used for dragging display.
                helper: function (event, item) {
                    // We select the item dragged, as it isn't selected on a single item drag.
                    item.addClass('selected');

                    return $('<div/>');
                },
                // Triggered when sorting starts.
                start: function (event, ui) {
                    var elements = $('.selected', fieldset).not('.ui-sortable-placeholder'),
                        itemCount = elements.length,
                        placeholder = ui.placeholder,
                        outerHeight = placeholder.outerHeight(true),
                        innerHeight = placeholder.height(),
                        margin = parseInt(placeholder.css('margin-top')) + parseInt(placeholder.css('margin-bottom'));

                    elements.hide();
                    placeholder.height(innerHeight + (itemCount - 1) * outerHeight - margin);
                    ui.item.data('items', elements);
                },
                // Triggered when sorting stops, but when the placeholder/helper is still available.
                beforeStop: function (event, ui) {
                    ui.item.before(ui.item.data('items'));
                },
                // Triggered when sorting has stopped.
                stop: function () {
                    $('.selected', fieldset).show();
                    self._serialize();
                },
                // Set on which axis items items can be dragged.
                axis: 'y',
                // Time in milliseconds to define when the sorting should start.
                delay: 100,
                // Tolerance, in pixels, for when sorting should start.
                distance: 5
            });

            // Bind list events.
            self._on(self._ui.list, {
                'click.item':   self._onSelect,
                'click.remove': self._onRemove,
                'change input': self._serialize
            });

            // For some reason "keyup" does not work with _on(), so for now…
            $('textarea.title', self._ui.list)
                .on('keyup', self._updateTitle)
                .on('keyup paste', function () {
                    self._serialize.call(self);
                })
                .css('height', '24px')
                .autogrow({
                    horizontal: false,
                    vertical: true
                });
            
            self._on({
                'click.add': self._onAdd,
            });
        },

        /**
         * Adds a file path to the list.
         *
         * @private
         *
         * @param {Object} event - The event
         */
        _onAdd: function () {
            // Remove empty list message, if there.
            $('>p', this._ui.list).remove();

            var $new = $(Bolt.data(
                'field.textlist.template.item',
                {
                    '%TITLE%': '',
                }
            ));

            // Append to list.
            this._ui.list.append($new);

            $('textarea.title', $new)
                .on('keyup', this._updateTitle)
                .on('keyup paste', this._serialize.bind(this))
                .css('height', '24px')
                .autogrow({
                    horizontal: false,
                    vertical: true
                });

            this._serialize();
        },

        /**
         * Handles on the list item remove button clicks.
         *
         * @private
         *
         * @param {Object} event - The event
         */
        _onRemove: function (event) {
            var item = $(event.target).closest('.item'),
                items = item.hasClass('selected') ? $('.selected', this._ui.list) : item,
                msgOne = 'field.textlist.message.remove',
                msgMlt = 'field.textlist.message.removeMulti';

            items.addClass('zombie');
            if (confirm(bolt.data(items.length > 1 ? msgMlt : msgOne))) {
                $(event.target).closest('.item').remove();
                this._serialize();
            } else {
                items.removeClass('zombie');
            }

            event.preventDefault();
            event.stopPropagation();
        },

        /**
         * Handles clicks on items.
         *
         * @private
         *
         * @param {Object} event - The event
         */
        _onSelect: function (event) {
            var item = $(event.target);

            if (item.hasClass('item')) {
                if (event.shiftKey) {
                    var begin = Math.min(this._lastClickIndex, item.index()),
                        end = Math.max(this._lastClickIndex, item.index());

                    // Select all items in range.
                    this._ui.list.children().each(function (idx, listitem) {
                        $(listitem).toggleClass('selected', idx >= begin && idx <= end);
                    });
                } else if (event.ctrlKey || event.metaKey) {
                    item.toggleClass('selected');
                    // Remember last clicked item.
                    this._lastClickIndex = item.index();
                } else {
                    var otherSelectedItems = this._ui.list.children('.selected').not(item);

                    // Unselect all other selected items.
                    otherSelectedItems.removeClass('selected');
                    // Select if others were selected, otherwise toogle.
                    item.toggleClass('selected', otherSelectedItems.length > 0 ? true : null);
                    // Remember last clicked item.
                    this._lastClickIndex = item.index();
                }
            }
        },

        /**
         * Serialize list data on change.
         */
        _serialize: function () {
            var template = 'field.textlist.template.empty',
                data = [];

            $('.item', this._ui.list).each(function () {
                data.push({
                    title: $('textarea.title', this).val()
                });
            });
            this._ui.data.val(JSON.stringify(data));

            // Display empty list message.
            if (data.length === 0) {
                this._ui.list.html(bolt.data(template));
            }
        },

        /**
         * Mirror changes on title into title attribute.
         *
         * @param {Object} event - The event
         */
        _updateTitle: function (event) {
            var item = $(event.target).closest('.item');

            $('a', item).attr('title', $('.title', item).val());
        }
    });
})(jQuery, Bolt);
