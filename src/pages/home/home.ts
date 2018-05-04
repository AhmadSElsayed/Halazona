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
	constructor(public navCtrl: NavController, private media: Media) {
		this.mediaCreator = this.media;
		this.socket = sio('http://10.0.0.120:17777/0', {forceNew: true});
		this.nsp = this.socket;
		
		this.nsp.on('connection', function (server) {
			console.log('Connected');
		});

		this.nsp.on('play', (data) => {
			console.log('Playing', data);
			this.track = this.mediaCreator.create(data.url);
			this.track.errorCallback = (error) => {console.log('error', error)};
			this.track.statusCallback = (error) => {console.log('status', error)};
			this.track.successCallback = (error) => {console.log('success', error)};
			this.playing = true;
			this.track.play();
			this.track.getCurrentPosition().then((p)=> {
					console.log('real position', p, this.track);
					this.track.seekTo(data.position);
					console.log('playing from:', data.position);
			});
		});

		this.nsp.on('seek', (data) => {
			this.track.play();
			this.playing = true;
			let timeOut = setTimeout(() => {
				this.track.seekTo(data.position + 100);
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

