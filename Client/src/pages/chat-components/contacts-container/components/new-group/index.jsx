import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const NewGroup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-transparent border border-dark-accent hover:bg-dark-accent/30 text-dark-text"
      >
        <Users className="mr-2 h-4 w-4" />
        New Group
      </Button>
      <CreateGroupModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default NewGroup;
