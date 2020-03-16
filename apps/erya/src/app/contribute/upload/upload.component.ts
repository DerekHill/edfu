import { Component } from '@angular/core';
import { UploadService } from './upload.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'edfu-upload',
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  fileToUpload: File = null;

  constructor(private fileUploadService: UploadService) {}

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFileToActivity() {
    this.fileUploadService.postFile(this.fileToUpload).subscribe(res => {
      // TODO: give user feedback on successful file upload
      console.log(res);
    });
  }
}
