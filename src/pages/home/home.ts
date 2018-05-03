import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Media, MediaObject } from '@ionic-native/media';
import * as sio from 'socket.io-client';
import 'rxjs/add/operator/map';
@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	track: MediaObject = null;
	mediaCreator: Media;
	playing: boolean;
	// Find Type
	nsp: any;
	socket: any;
	status:number;
	constructor(public navCtrl: NavController, private media: Media) {
		var that = this;
		this.mediaCreator = this.media;
		this.socket = sio('http://localhost:17777', {forceNew: true});
		//this.nsp = sio('/music', {forceNew: true});
		this.nsp = this.socket;
		
		this.nsp.on('connection', function (server) {
			console.log('Connected');
		});

		this.nsp.on('play', (data) => {
			console.log('Playing', data);
			that.track = that.mediaCreator.create(data.url);
			this.track.play();
			this.track.onStatusUpdate.subscribe((s) => {this.status = s});
			that.track.onError.subscribe(error => console.log('Error', error));
			that.playing = true;
			//let timeOut = setTimeout(() => {
			while(this.status != 2)
				that.track.seekTo(data.position + 100);
			//	console.log('starting from:', data.position);
			//}, 100);
		});

		this.nsp.on('seek', (data) => {
			that.track.play();
			that.playing = true;
			let timeOut = setTimeout(() => {
				that.track.seekTo(data.position + 100);
				console.log('seeking from:', data.position);
			}, 100);		
		});
	}

	controlling(action) {		
		switch (action) {
			case 'play':
				this.nsp.emit('play', { trackID: 'song'});
				break;

			case 'pause':
				console.log('pause');
				this.track.pause();
				this.playing = false;
				break;
		}
	}

	stopTrack() {
		this.track.stop();
	}
}

