import { useState } from "react";

type UseEntityDialogsResult<TEntity> = {
  isEditModalOpen: boolean;
  editingEntity: TEntity | null;
  entityToArchive: TEntity | null;
  openCreate: () => void;
  openEdit: (entity: TEntity) => void;
  closeEdit: (disabled?: boolean) => void;
  openArchive: (entity: TEntity) => void;
  closeArchive: (disabled?: boolean) => void;
};

export const useEntityDialogs = <TEntity>(): UseEntityDialogsResult<TEntity> => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<TEntity | null>(null);
  const [entityToArchive, setEntityToArchive] = useState<TEntity | null>(null);

  const openCreate = () => {
    setEditingEntity(null);
    setIsEditModalOpen(true);
  };

  const openEdit = (entity: TEntity) => {
    setEditingEntity(entity);
    setIsEditModalOpen(true);
  };

  const closeEdit = (disabled = false) => {
    if (disabled) {
      return;
    }

    setIsEditModalOpen(false);
    setEditingEntity(null);
  };

  const openArchive = (entity: TEntity) => {
    setEntityToArchive(entity);
  };

  const closeArchive = (disabled = false) => {
    if (disabled) {
      return;
    }

    setEntityToArchive(null);
  };

  return {
    isEditModalOpen,
    editingEntity,
    entityToArchive,
    openCreate,
    openEdit,
    closeEdit,
    openArchive,
    closeArchive,
  };
};
