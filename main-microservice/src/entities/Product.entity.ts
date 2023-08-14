import { Column, Entity, ObjectIdColumn } from "typeorm";
import { ObjectId } from "bson";

@Entity()
export class Product {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  adminId: number;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column({ nullable: true, default: 0 })
  likes: number;
}
