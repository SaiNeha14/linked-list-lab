class LinkedList {

    // Node represents one element in the linked list
    class Node {
        int data;
        Node next;

        Node(int data) {
            this.data = data;
            this.next = null;
        }
    }

    Node head;

    // Add a new node at the end
    public void add(int data) {
        Node newNode = new Node(data);

        if (head == null) {
            head = newNode;
            return;
        }

        Node current = head;

        while (current.next != null) {
            current = current.next;
        }

        current.next = newNode;
    }

    // Display the linked list
    public void display() {
        Node current = head;

        while (current != null) {
            System.out.print(current.data + " -> ");
            current = current.next;
        }

        System.out.println("NULL");
    }

    public static void main(String[] args) {

        LinkedList list = new LinkedList();

        // Add elements
        list.add(10);
        list.add(20);
        list.add(30);
        list.add(40);

        // Display list
        System.out.println("Linked List:");
        list.display();
    }
}
