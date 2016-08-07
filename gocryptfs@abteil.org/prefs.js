const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;


const GocryptfsManagerSettings = new GObject.Class({
    Name: 'Gocryptfs-Manager-Settings',
    Extends: Gtk.Grid,

    _init: function(params) {
        // Gtk Grid init
        this.parent(params);
        this.set_orientation(Gtk.Orientation.VERTICAL);
        this.margin = 20;

        // Open settings
        this._settings = Convenience.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._refresh));
    },
    _refresh: function(params) {

    }
});

function init() {
}

function buildPrefsWidget() {
    let widget = new GocryptfsManagerSettings();
    widget.show_all();

    return widget;
}
