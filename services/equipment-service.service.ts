
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs';
import { NuviotClientService } from './nuviot-client.service';


export class EquipmentService {

  private _equipment: FSLite.Equipment;
  private _equipment$ = new ReplaySubject<FSLite.Equipment>();

  constructor(private nuviotClient: NuviotClientService) {
  }

  loadEquipment(id: string): Promise<FSLite.Equipment> {
    const promise = new Promise<FSLite.Equipment>((resolve, reject) => {
      this.nuviotClient.request<FSLite.Equipment>(`/api/equipment/${id}/detail`)
        .then(resp => {
          this.setEquipment(resp);
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  onEquipment(): Observable<FSLite.Equipment> {
    return this._equipment$.asObservable();
  }

  setEquipment(equipment: FSLite.Equipment) {
    this._equipment = equipment;
    this._equipment$.next(equipment);
  }

}
