const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;
const Gtk = imports.gi.Gtk;

const ExtensionSystem = imports.ui.extensionSystem;
const ExtensionUtils = imports.misc.extensionUtils;

const PopupGocryptfsItem = new Lang.Class({
    Name: 'PopupGocryptfsItem',
    Extends: PopupMenu.PopupSwitchMenuItem,

    _init: function(text, active, params) {
        this.parent(text, active, params);

        this.openFolderButton = new St.Button({ x_align: 1,
                                                reactive: true,
                                                can_focus: true,
                                                track_hover: true,
                                                accessible_name: 'open',
                                                style_class: 'system-menu-action gocryptfs-button-open' });

        this.openFolderButton.child = new St.Icon({ icon_name: 'document-open-symbolic' });
        this.actor.add(this.openFolderButton, { expand: false, x_align: St.Align.END });
    }
});