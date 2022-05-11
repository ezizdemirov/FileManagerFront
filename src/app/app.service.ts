import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BaseService } from './base.service';

/// bu klaslarin burada tanidilmasi duzgun deyil!!! bunu bilirem, vaxt yoxdur oynamaga
export class FileSystemItem {
  id: number;
  parentId?: string;
  name: string;
  icon: string;
  isDirectory: boolean;
  expanded?: boolean;
  createdDate: Date;
}

export class UploadViewModel {
  id: number;
  form: FormData;
}

@Injectable({
  providedIn: 'root',
})
export class Service extends BaseService {
  constructor(private http: HttpClient) {
    super();
  }

  getFileManager() {
    return this.http.get<FileSystemItem[]>(
      `https://localhost:44342/api/FileManager/GetFileManager`
    );
  }

  createFolder(model: FileSystemItem) {
    return this.http.post<FileSystemItem>(
      environment.rootUrl + 'FileManager/CreateFolder',
      model
    );
  }

  deleteFolder(id: number) {
    return this.http.delete<any>(
      environment.rootUrl + `FileManager/DeleteFolder?id=${id}`
    );
  }
  getById(id: number) {
    return this.http.get<FileSystemItem>(
      environment.rootUrl + `FileManager/getById?id=${id}`
    );
  }

  uploadFile(model: FormData) {
    return this.http
      .post(environment.rootUrl + 'FileManager/UploadFile', model)
      .toPromise();
  }
}
